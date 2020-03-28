
import { API, graphqlOperation } from "aws-amplify"
import { listCasePoints } from '../../graphql/queries'
import Amplify from "aws-amplify"
import awsconfig from "../../aws-exports"

var moment = require('moment')

Amplify.configure(awsconfig)


export async function  getDataPoints()  {
    let filterDate = moment().utc().subtract(1, 'days').endOf('day')
    console.log(filterDate.format())
    const result = await API.graphql(graphqlOperation(listCasePoints,   {
      limit: 10000,
      filter: {
        date: {
          eq: filterDate.format(),
        },
        countryRegion: {
          eq: "US"
        }
      }
    }))
    console.log(result.data.listCasePoints.items.length)
  }
