import boto3
import json
import numpy as np  
import pandas as pd
from scipy.optimize import curve_fit
from datetime import datetime, timedelta
from fbprophet import Prophet


def lambda_handler(event, context):
    print('hiii')
    county_df = fethCountryDataFrame()
    print(county_df.tail())

    result = [        
      {
        'date': '2020-04-04',
        'confrimed': 100,
        'recovered': 50,
        'deaths': 30,
      }, {
        'date': '2020-04-05',
        'confrimed': 100,
        'recovered': 50,
        'deaths': 30,
      }, {
        'date': '2020-04-06',
        'confrimed': 100,
        'recovered': 50,
        'deaths': 30,
      }, {
        'date': '2020-04-07',
        'confrimed': 100,
        'recovered': 50,
        'deaths': 30,
      }, {
        'date': '2020-04-08',
        'confrimed': 100,
        'recovered': 50,
        'deaths': 30,
      }
    ]
    

    return {
        'statusCode': 200,
        'body': json.dumps(result)
    }


def fethCountryDataFrame():
    invokeLam = boto3.client('lambda', region_name='us-east-1')
    payload = {
        "resource": "/casePoint/{proxy+}",
        "path": "/casePoint/predictionStats",
        "httpMethod": "GET"
    }

    response = invokeLam.invoke(FunctionName='covidfunction-dev',
                                InvocationType='RequestResponse', Payload=json.dumps(payload))

    jsonResponse = json.loads(response['Payload'].read())
    county_df = pd.DataFrame(json.loads(jsonResponse['body'])['body'])
    return county_df


if __name__ == '__main__':
    lambda_handler([], [])
