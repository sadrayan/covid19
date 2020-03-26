/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createCasePoint = /* GraphQL */ `
  mutation CreateCasePoint(
    $input: CreateCasePointInput!
    $condition: ModelCasePointConditionInput
  ) {
    createCasePoint(input: $input, condition: $condition) {
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
export const updateCasePoint = /* GraphQL */ `
  mutation UpdateCasePoint(
    $input: UpdateCasePointInput!
    $condition: ModelCasePointConditionInput
  ) {
    updateCasePoint(input: $input, condition: $condition) {
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
export const deleteCasePoint = /* GraphQL */ `
  mutation DeleteCasePoint(
    $input: DeleteCasePointInput!
    $condition: ModelCasePointConditionInput
  ) {
    deleteCasePoint(input: $input, condition: $condition) {
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
