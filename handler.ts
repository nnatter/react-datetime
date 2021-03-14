import { DBModel, TableItem } from './src/dynamo/db';
import AccountModel from './src/dynamo/AccountModel';
import ExchangeAccountModel from './src/dynamo/ExchangeAccountModel';

export async function hello( event ){ 
  console.log('Hi there!', event);
  // await tryDynamo();
  if( isTest(event) ){
    setTestData(event);
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};


async function tryDynamo(){
  let db = new DBModel<TableItem>()
  let res;
  // create document 1
  res = await db.put({accountId: 'accId1', resourceId: 'resource#resId1'});
  console.log('Document created ok', res);
  // create document 2
  res = await db.put({
    accountId: 'accId1',
    resourceId: 'resource#resId2',
    foo: 'bar'
  });
  console.log('Document created ok', res);

  // Get document 1
  res = await db.getSingle('accId1', 'resource#resId1');
  console.log('Document got ok', res);

  // Get multiple documents
  res = await db.getMultiple('accId1', 'resource#');
  console.log('Documents got ok', res);

  // Update document
  res = await db.update('accId1', 'resource#resId2', {foo: 'bar2', other: 'attr'});
  res = await db.getSingle('accId1', 'resource#resId2');
  console.log('Documents updated ok', res);

  // delete documents
  res = await db.del('accId1', 'resource#resId1');
  await db.del('accId1', 'resource#resId2');
  console.log('Document deleted ok', res);

  // Get document 1
  res = await db.getSingle('accId1', 'resource#resId1');
  console.log('Document got ok', res);
}


function isTest( event ){
  return event && event.isTest;
}

async function setTestData( event ) {
  let {accountId, deploymentId} = event;
  let account = await AccountModel.getSingle(accountId);
  if( !account ){
    console.log('Creating test data');
    await AccountModel.create({
      accountId
    });

    await ExchangeAccountModel.create({
      accountId,
      exchangeAccountId: 'testExchange',
      provider: 'bitfinex',
      exchangeType: 'real',
      key: 'Mma7B6ISTUNVcnUPOrDJgVgcNRh3VbmeIalaBDvUpml',
      secret: 'ckm9hrkka000dyq349ngb2jro'
    });


  }
}