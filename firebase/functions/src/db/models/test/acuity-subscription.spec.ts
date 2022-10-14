import {it} from "mocha";
import {assert} from "chai";
import {AcuitySubscriptionCodec} from "../AcuitySubscription";

it("should be free for when cost is 0 and balance is 0", () => {
  const decoded = AcuitySubscriptionCodec.decode(
    {
      "id": 40647078,
      "certificate": "CB6B8C27",
      "productID": 1330349,
      "orderID": 99407521,
      "appointmentTypeIDs": [
        16299344,
        16321358,
        24164653,
        35551733,
        35551758,
      ],
      "appointmentTypes": {
        "16299344": "VideoVisit",
        "16321358": "QuickChat",
        "24164653": "Health and Wellness",
        "35551733": "Membership Discount - KIIRAMEMBER01",
        "35551758": "Membership IV Drip Discount - KIIRAFRIENDIV50",
      },
      "name": "Kiira Membership",
      "email": "joann.smith1203@gmail.com",
      "type": "appointments",
      "remainingCounts": {
        "16299344": 2,
        "16321358": 1,
        "24164653": 1,
        "35551733": 1,
        "35551758": 1,
      },
      "remainingMinutes": null,
      "remainingValue": null,
      "remainingValueLocal": null,
      "expiration": "2023-09-28 23:59",
    },
  );
  assert.equal(decoded.isRight(), true, decoded.leftOrDefault(""));
});
