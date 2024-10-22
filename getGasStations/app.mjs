import {DynamoDBClient} from "@aws-sdk/client-dynamodb"
import {DynamoDBDocumentClient,ScanCommand} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)
var table = process.env.TABLE_GAS_STATIONS
export const lambdaHandler = async (event, context) => {
  var tableData = []

  var parms = {
    ProjectionExpression: "Station_ID",
    TableName: table,
  }
  try{
    const command = new ScanCommand(parms)
    var data = await docClient.send(command)
    tableData = data.Items

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET'
        
      },
      body: JSON.stringify(JSON.stringify(tableData))
    };

    return response;
    

  }
  catch(err){
    const errResponse = {
      statusCode: 400,
      body: "Failed to retreive table data from Gas Station table, Error: "+err
    };

    return errResponse;

  }

   
  };
  