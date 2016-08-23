'use strict';

var should = require('./init.js');
const assert = require('assert');
const path = require('path');
const dynamodb = require('../lib/dynamodb.js');
const DataSource = require('loopback-datasource-juggler').DataSource;

const index1 = {
  name: 'Test-playerId-born-index1',
  hashKey: { key: 'playerId', type: 'N' },
  rangeKey: { key: 'born', type: 'N' }
};

const where1 = {
  playerId: 1,
  born: { between: [ 100, 200 ]},
  or: [
    { height: { between: [ 68, 75 ]}},
    { weight: { lt: 88 }},
    { and: [
      { team: 'Giants'},
      { lastName: 'Beckham' }
    ]}
  ]
}

var config = require('rc')('loopback', {test: {dynamodb: {
    region: 'local',
    credentials: 'file',
    credfile: path.join(__dirname, 'credentials.json'),
    endpoint: 'http://localhost:8080'
}}}).test.dynamodb;

describe('Test', () => {
  describe('sub 1', () => {
    it('should pass', () => {
      assert.equal(5, 5);
    });

    it('lets try this', () => {
      // console.log(dynamodb.initialize);
      // let what = dynamodb.DynamoDB;
      // console.log(what);
      // let obj = dynamodb.splitWhere(index1, where1);
      //dynamodb.test();
      //test();
      // let myDynamodb = dynamodb.initialize({});
      // console.log(myDynamodb);
      // var ds = new DataSource(require('../'), config);
      // dynamodb.initialize(ds, () => {
      //   let obj = ds.connector.splitWhere(index1, where1);
      //   console.log(obj.keyQuery);
      //   assert.notEqual(obj, null);
      // });

      let obj = dynamodb.DynamoDB.prototype.splitWhere(index1, where1);
      console.log(obj.keyQuery);

      // let obj = DynamoDB.prototype.splitWhere(index1, where1);
      
      // assert.notEqual(obj, null);
    });
  });
});