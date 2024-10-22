import {DynamoDBClient} from "@aws-sdk/client-dynamodb"
import {DynamoDBDocumentClient,ScanCommand} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)
var table = process.env.TABLE_GRASP_USERS
export const lambdaHandler = async (event, context) => {
  var tableData = []

  var parms = {
    ProjectionExpression: "User_ID",
    TableName: table,
  }
  try{
    const command = new ScanCommand(parms)
    var response = await docClient.send(command)
    tableData = response.Items

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
      body: "Failed to retreive table data from users table, Error: "+err
    };

    return errResponse;

  }

   
  };
  