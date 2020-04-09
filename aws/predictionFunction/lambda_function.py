
# coding: utf-8

# In[1]:


import numpy as np 
import pandas as pd
from datetime import datetime, timedelta
from fbprophet import Prophet
from numpy import exp, linspace, random
import pymongo
import os
dbConnectionString = os.environ['dbConnectionString']
dbClient = os.environ['dbClient']


# In[2]:


client = pymongo.MongoClient(dbConnectionString)
db = client[dbClient]
collection = db['forecasts']
casepoint_collection = db['casedatapoints']



# In[5]:


query = [{
    '$group': {
      '_id': {
        '__alias_0': '$date',
        '__alias_5': '$countryRegion'
      },
      '__alias_1': {
        '$sum': '$confirmed'
      },
      '__alias_2': {
        '$sum': '$recovered'
      },
      '__alias_3': {
        '$sum': '$active'
      },
      '__alias_4': {
        '$sum': '$deaths'
      }
    }
  }, {
    '$project': {
      '_id': 0,
      '__alias_0': '$_id.__alias_0',
      'country': '$_id.__alias_5',
      '__alias_1': 1,
      '__alias_2': 1,
      '__alias_3': 1,
      '__alias_4': 1
    }
  }, {
    '$project': {
      'confirmed': '$__alias_1',
      'date': '$__alias_0',
      'recovered': '$__alias_2',
      'active': '$__alias_3',
      'deaths': '$__alias_4',
      'country': '$country',
      '_id': 0
    }
  }, {
    '$sort': {
      'date': 1
    }
  }]

def get_data():
    result = casepoint_collection.aggregate(query)
    x = []
    for i in result:
        x.append(i)
    data = pd.DataFrame(x)
    data.tail()
    return data

get_data().tail()

# In[6]:


def save_fb_mongo(data, case_type, country):

    date = pd.to_datetime(datetime.utcnow().date(), format='%Y-%m-%d')
    data['model'] = 'fbProphet'
    data['country'] = country
    data['case_type'] = case_type
    data['date'] = date
    data['date'] = pd.to_datetime(data['date'])
    data['ds'] = data['ds'].apply(lambda x: x.strftime('%Y-%m-%d'))
    cols = ['yhat', 'yhat_lower', 'yhat_upper']
    data[cols] = data[cols].astype(int)
    
    data.reset_index(inplace=True)

    data_dict = data.to_dict("records")
    
    # first clear the prediction
    collection.delete_many({ 'model' : "fbProphet", 
                            'case_type' : case_type,
                            'country' : country,
                            'date': date })
   
    # Insert collection
    collection.insert_many(data_dict)
    print('completed insert')


# In[13]:


def prophet(df, country, case_type, next_days):
    country_df = df[df["country"]==country] 
    df_prophet = country_df.groupby('date').sum()[case_type].reset_index()
    df_prophet.columns = ['ds','y']
    df_prophet['ds'] = pd.to_datetime(df_prophet['ds'])

    m = Prophet(
        changepoint_prior_scale=0.4,
        changepoint_range=0.98,
        yearly_seasonality=False,
        weekly_seasonality=False,
        daily_seasonality=True,
        seasonality_mode='additive'
    )

    m.fit(df_prophet)

    future = m.make_future_dataframe(periods=next_days)
    forecast = m.predict(future)

    save_fb_mongo(forecast, case_type, country)
    print(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(next_days))
    return forecast    


    
# In[15]:


def lambda_handler(event, context):
    data = get_data()
    countryList = ['US', 'Spain', 'Italy', 'Germany', 'France', 'China', 'Iran', 'United Kingdom']
    next_days = 5
    
    for country in countryList: 
        print('processing country', country)
        for case_type in ['confirmed', 'deaths', 'recovered']:
            prophet(data, country, case_type, next_days)