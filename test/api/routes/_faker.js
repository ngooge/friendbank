const ms = require('ms');
const { MongoClient } = require('mongodb');
const { MONGODB_URL } = process.env;
const { passwordHash } = require('../../../src/api/utils/auth');

async function fakeUser({
  campaign = '',
  email = 'ed@edmarkey.com',
  password = 'password',
  firstName = 'Ed',
  zip = '00000',
  emailFrequency = 'WEEKLY_EMAIL',
}) {
  const client = await MongoClient.connect(MONGODB_URL, { useUnifiedTopology: true });
  const db = client.db();
  const users = db.collection('users');

  const hashedPassword = await passwordHash(password);

  const result = await users.insertOne({
    campaign,
    email,
    password: hashedPassword,
    firstName,
    zip,
    emailFrequency,
    createdAt: Date.now(),
    lastUpdatedAt: Date.now(),
    lastAuthenticationUpdate: '1',
  });

  return result.ops[0];
}

async function fakeToken({
  tokenValue = '123',
  user = '',
  expiresAt = Date.now() + ms('30 days'),
}) {
  const client = await MongoClient.connect(MONGODB_URL, { useUnifiedTopology: true });
  const db = client.db();
  const tokens = db.collection('tokens');

  const result = await tokens.insertOne({
    _id: tokenValue,
    user,
    expiresAt,
    lauCompare: '1',
  });

  return result.ops[0];
}

async function fakeCampaign({
  domains = ['api:5000'],
  name = 'Team Markey',
}) {
  const client = await MongoClient.connect(MONGODB_URL, { useUnifiedTopology: true });
  const db = client.db();
  const campaigns = db.collection('campaigns');

  const result = await campaigns.insertOne({
    domains,
    name,
  });

  return result.ops[0];
}

async function fakePage({
  title,
  subtitle,
  background,
  code,
  campaign,
  user,
}) {
  const client = await MongoClient.connect(MONGODB_URL, { useUnifiedTopology: true });
  const db = client.db();
  const pages = db.collection('pages');

  const result = await pages.insertOne({
    title,
    subtitle,
    background,
    code,
    campaign,
    user,
  });

  return result.ops[0];
}

async function standardTestSetup() {
  const campaign = await fakeCampaign({});
  const user = await fakeUser({ campaign: campaign._id.toString() });
  const token = await fakeToken({ user: user._id.toString() });

  return {
    token: token._id.toString(),
    user,
    campaign,
  };
}

module.exports = {
  fakeUser,
  fakeToken,
  fakeCampaign,
  fakePage,
  standardTestSetup,
};