import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

// Crear el cliente DynamoDB y el cliente de documentos
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Obtener el nombre de la tabla desde la variable de entorno
var table = process.env.TABLE_GAS_STATIONS;

// Fórmula Haversine para calcular la distancia entre dos puntos en la Tierra
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * (Math.PI / 180); // Convertir grados a radianes
  const dLon = (lon2 - lon1) * (Math.PI / 180); // Convertir grados a radianes
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en kilómetros
}

export const lambdaHandler = async (event, context) => {
  // Obtener latitud y longitud desde los parámetros de la solicitud

  // const lat = parseFloat(event.queryStringParameters.lat);
  // const long = parseFloat(event.queryStringParameters.long);
  const long = -66.0084161
  const lat = 17.9946388

  var tableData = [];

  // Definir los parámetros del escaneo en DynamoDB
  var params = {
    ProjectionExpression: "Station_ID, Station_City, Station_Gas_Price, Station_Lattitude, Station_Longitude, Station_Name",
    TableName: table,
  };

  try {
    // Escanear todos los items en la tabla
    const command = new ScanCommand(params);
    const data = await docClient.send(command);
    tableData = data.Items;

    // Calcular la distancia para cada gasolinera usando latitudes y longitudes guardadas
    const stationsWithDistance = tableData.map(station => {
      const stationLat = parseFloat(station.Station_Lattitude);
      const stationLong = parseFloat(station.Station_Longitude);
      
      const distance = calculateDistance(lat, long, stationLat, stationLong);
      
      // Agregar la distancia calculada al objeto de la estación
      return { ...station, distance };
    });

    // Ordenar las estaciones por distancia y tomar las 5 más cercanas
    stationsWithDistance.sort((a, b) => a.distance - b.distance);
    const nearestStations = stationsWithDistance.slice(0, 5);

    // Respuesta HTTP con las estaciones más cercanas
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET',
      },
      body: JSON.stringify(nearestStations),
    };

    return response;
  } catch (err) {
    // En caso de error, enviar un mensaje de error
    const errResponse = {
      statusCode: 400,
      body: "Failed to retrieve table data from Gas Station table, Error: " + err,
    };

    return errResponse;
  }
};
