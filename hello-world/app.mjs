/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

import pkg from 'pg';
const { Client } = pkg;

export const lambdaHandler = async (event, context) => {
  // Create a new PostgreSQL client using environment variables
  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432 // default PostgreSQL port
  });

  try {
    // Connect to the database
    await client.connect();

    // Execute a query to fetch all rows from the 'users' table
    const query = 'SELECT * FROM users';  // Modify the table name as needed
    const result = await client.query(query);

    // Check if any rows were returned
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'No users found',
        }),
      };
    }

    // Return the users data
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Users retrieved successfully',
        users: result.rows,  // Return all rows
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',  // Enable CORS if needed
        'Content-Type': 'application/json',
      },
    };

    // Close the client connection
    await client.end();

    return response;

  } catch (err) {
    console.error('Database query error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Database query failed',
        error: err.message,
      }),
    };
  }
};

  