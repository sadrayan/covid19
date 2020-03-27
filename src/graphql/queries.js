/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getCasePoint = /* GraphQL */ `
  query GetCasePoint($id: ID!) {
    getCasePoint(id: $id) {
      id
      FIPS
      admin2
      provinceState
      countryRegion
      lastUpdate
      lat
      long
      confirmed
      deaths
      recovered
      active
      combinedKey
      date
      createdAt
    }
  }
`;
export const listCasePoints = /* GraphQL */ `
  query ListCasePoints(
    $filter: ModelCasePointFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCasePoints(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        FIPS
        admin2
        provinceState
        countryRegion
        lastUpdate
        lat
        long
        confirmed
        deaths
        recovered
        active
        combinedKey
        date
        createdAt
      }
      nextToken
    }
  }
`;
export const casePointByCountry = /* GraphQL */ `
  query CasePointByCountry(
    $countryRegion: String
    $date: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCasePointFilterInput
    $limit: Int
    $nextToken: String
  ) {
    casePointByCountry(
      countryRegion: $countryRegion
      date: $date
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        FIPS
        admin2
        provinceState
        countryRegion
        lastUpdate
        lat
        long
        confirmed
        deaths
        recovered
        active
        combinedKey
        date
        createdAt
      }
      nextToken
    }
  }
`;
