// const R = require('ramda')

const StatusExpeditionDomain = require(".");

// const { FieldValidationError } = require('../../../helpers/errors')

const statusExpeditionDomain = new StatusExpeditionDomain();

describe("reserveOsDomain", () => {
  beforeAll(async () => {});

  test("create statusExpedition", async () => {
    const statusExpeditionMock = {
      status: "CONSERTO"
    };
    const statusExpeditionCreated = await statusExpeditionDomain.add(
      statusExpeditionMock
    );

    expect(statusExpeditionCreated.status).toBe(statusExpeditionCreated.status);
  });
});
