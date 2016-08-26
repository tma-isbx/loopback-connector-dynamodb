'use strict';

const assert = require('assert');
const dynamodb = require('../lib/dynamodb.js');

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
};

const where2 = {
  or: [
    { and: [
      { key1: 1 },
      { key2: 2 },
      { or: [
        { key3: 3 },
        { key4: 4 }
      ]},
      { key5: 5 }
    ]},
    { and: [
      { or: [
        { key6: 6 },
        { key7: 7 }
      ]},
      { key8: 8 }
    ]}
  ]
};

const obj = dynamodb.DynamoDB.prototype.splitWhere(index1, where1);

describe('Testing splitWhere', () => {
  it('should return object with keyQuery', () => {
    assert.notEqual(obj.keyQuery, null);
  });

  it('should return object with filterQuery', () => {
    assert.notEqual(obj.filterQuery, null);
  });

  it('keyQuery should have the whereObject for keys', () => {
    assert.equal(obj.keyQuery.playerId, 1);
    assert.equal(obj.keyQuery.born.between[0], 100);
    assert.equal(obj.keyQuery.born.between[1], 200);
  });

  it('filterQuery should have the whereObject for filter', () => {
    assert.equal(obj.filterQuery.or.length, 3);
    assert.equal(obj.filterQuery.or[0].height.between[0], 68);
    assert.equal(obj.filterQuery.or[1].weight.lt, 88);
    assert.equal(obj.filterQuery.or[2].and[0].team, 'Giants');
    assert.equal(obj.filterQuery.or[2].and[1].lastName, 'Beckham');
  })
});

describe('Testing convertWhereObjectToAndArray', () => {
  let andArray = dynamodb.DynamoDB.prototype.convertWhereObjectToAndArray(where1);

  it('return andArray should have same properties as whereObject', () => {
    andArray.forEach((ele) => {
      let key = Object.keys(ele)[0];
      assert.equal(ele[key], where1[key]);
    });
  });
});

describe('Testing generateExpression', () => {
  let params = {};
  let keyConditionExpression = dynamodb.DynamoDB.prototype.generateExpression(params, dynamodb.DynamoDB.prototype.convertWhereObjectToAndArray(obj.keyQuery));
  let filterExpression = dynamodb.DynamoDB.prototype.generateExpression(params, dynamodb.DynamoDB.prototype.convertWhereObjectToAndArray(obj.filterQuery));

  it('should have correct KeyConditionExpression chained with AND', () => {
    assert.equal(keyConditionExpression, '((#playerId = :1) AND (#born BETWEEN :100 AND :200))');
  });

  it('should have correct FilterExpression chained with AND and OR', () => {
    assert.equal(filterExpression, '((#height BETWEEN :68 AND :75) OR (#weight < :88) OR ((#team = :Giants) AND (#lastName = :Beckham)))');
  });

  it('should have correct ExpressionAttributeNames with #', () => {
    assert.equal(params.ExpressionAttributeNames['#playerId'], 'playerId');
    assert.equal(params.ExpressionAttributeNames['#born'], 'born');
    assert.equal(params.ExpressionAttributeNames['#height'], 'height');
    assert.equal(params.ExpressionAttributeNames['#weight'], 'weight');
    assert.equal(params.ExpressionAttributeNames['#team'], 'team');
    assert.equal(params.ExpressionAttributeNames['#lastName'], 'lastName');
  });

  it('should have correct ExpressionAttributeValues with :', () => {
    assert.equal(params.ExpressionAttributeValues[':1'], 1);
    assert.equal(params.ExpressionAttributeValues[':100'], 100);
    assert.equal(params.ExpressionAttributeValues[':200'], 200);
    assert.equal(params.ExpressionAttributeValues[':68'], 68);
    assert.equal(params.ExpressionAttributeValues[':75'], 75);
    assert.equal(params.ExpressionAttributeValues[':88'], 88);
    assert.equal(params.ExpressionAttributeValues[':Giants'], 'Giants');
    assert.equal(params.ExpressionAttributeValues[':Beckham'], 'Beckham');
  });

});

describe('Testing whereObject with complex AND/OR', () => {
  let params = {};
  let expression = dynamodb.DynamoDB.prototype.generateExpression(params, dynamodb.DynamoDB.prototype.convertWhereObjectToAndArray(where2));

  it('should generate correct Expression with complex AND/OR logic', () => {
    assert.equal(expression, '(((#key1 = :1) AND (#key2 = :2) AND ((#key3 = :3) OR (#key4 = :4)) AND (#key5 = :5)) OR (((#key6 = :6) OR (#key7 = :7)) AND (#key8 = :8)))');
  });
});