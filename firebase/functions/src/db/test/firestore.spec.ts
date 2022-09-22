import {describe, it} from "mocha";
import {assert} from "chai";
import {CreditType, ServiceCost, UserCredits} from "../../core/bll/services/service-pricing";
import * as admin from "firebase-admin";
import {ServiceAccount} from "firebase-admin";
import {firestoreUserLookup} from "../firestore-user-lookup";
import {firestoreServiceLookup} from "../firestore-service-lookup";
import {Maybe} from "purify-ts";

const firebaseConfig = <ServiceAccount>{
  "type": "service_account",
  "project_id": "kiira-health-dev",
  "private_key_id": "ddba1400327e6bd4513fe826cfa103d02adc866c",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCjqAAs+vLyfWag\n3uFRqYGfpf+tkBnQOqpZ8OVpbFC9Kkfd1ssKK6HG8TdG2s31tzvVuT85HXQUbVst\nTzPmH+0Js/ho3aMi76fif3diJwRCFkqp/pGjMG+HMlx4zCgZ/mkDzJaSBc5YtRXd\n4jkkbE1/Vb4IfVFPihz3isQDO3hv/ae4UGntEBf29yOXntCNE5/ddSVSig7BYPme\nG9J9pymmTruo1hqARNxt5GCnMPzvvY39f+c983F7yu0wB40ZnIAh9mCmrPAy4Q0X\nU/5BktXXRewhHpO2u7LTFmdcr9DHm13/HNjTAp3Djlq2f3iDjuXJ8/u2ydS+vcuh\nnjc8Q/YNAgMBAAECggEATYoMw0MHFsM5e+D96p4gT07sLATJZjJVghWz7FYojufY\ncxAQ1TnFBahGI2kKCnCNhf6mKN5+oCsL9xS+pzrbKSy+9piEccoQxizUmImZ5+H9\n8DswL5yESw8eZxF7so0qnmUxte/QS5FI0f8cSdiSg1FRn14Yx1HN1a9Gna1wq8ZF\nUCmgoERmtagzSM0hr7UoPvWvNeEIfsoMtNG6JMhlfQ4K2MDDEhkZKa9WssRpU3+j\nI76p8aP0Ho1gwG4QXlFARpm/Xx/kDYGJs1OAHX/WLXXjfrIjZce0kgNJxFD+vGus\n1ZbDUP3FBJIikZ0H+vsvJ2sYia6/6WnkZOYWq6OtNQKBgQDch7jab+gUrAo8gnA6\nZXNar0Dn3lXBdTV9mYwlO2Afrs9+kT999xkHXtLMRKLndvouJyX7F7CZTZcsyLKS\nneZkbLAh93tQmCBdVs/FYAz2P1AyxIbZlYnfoAh/Y5IhWTPNVolSTNeXa5nm46Vj\nQbMrQTD2tT3LB48lFrY3imRdswKBgQC9+oIzY/Pf9M3YmvqCn/jqXcidbGtjfCX7\nNPHT8BmgQIfa3myXOCJ24B7PE6NDYtdjAh94tRsuoM4LfwL9EaHrufDKdFWNMPZu\nRF5//WGqjeSNF5bYGV6n3EQACKindrHz/ouFVsLwGNvEamwOJoBvqTOsOyg/9oja\n8ClGKa39PwKBgGcjxu3KptV8PPFd5BU7u36vNoD7OEpZgiHy/VuwcF2BCaRdVD+a\noIcU7yv/8dylhY6uWpIb20lnw4t7diEiXk2bk6jfMTpZW9Grt1LNgGJu7BhCV/tN\neAUxuKezrvWP3a1sip8GN1KnTXxx/bj1UlGplLfdvj/Fkko7XA+P1y8HAoGAHvNS\nBPdSwvjKFHDjQSa40c3noiYItNOECJIOl920/xOkTncQL+64Rq+qtUfYwGC5AGtX\nHz46KHWQO/U8Umht/c50OTeMvIzuiPZggu+P2s51HrtqGti/QA+1kF/YwjenND4T\nEu0Yoy8Zlr1Tz1ZcdFSXk4arvwf2Md0QjFq7+tcCgYEA0O3EhorZodVVGMJ7JBO4\n3ozYikZIs+Vvyg9BLTdjmUQsCbgAh7WqIj6QOoRXm+M4ylRMZT39xPjY5sv9pnzV\n1JP8DrWpAV5+Dxie+dVp3QMLSU/QbT9FbGArOo28ilnB9ZbHwQJLl+FR1yhvQyek\nZtV6vYdxokVO3LIvc/KJGYU=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-46hup@kiira-health-dev.iam.gserviceaccount.com",
  "client_id": "106462619516423285501",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-46hup%40kiira-health-dev.iam.gserviceaccount.com",
};

admin.initializeApp({credential: admin.credential.cert(firebaseConfig)});
const firestore = admin.firestore();

const userId = "Jl3x86LgLpPGyQLsAwIwcB7UwTq2";
describe("Firestore Tests", () => {
  it("get user visits", async () => {
    const userCredits: Maybe<UserCredits> = await firestoreUserLookup(firestore).credits(userId);
    assert.equal(userCredits.unsafeCoerce().visits, 2);
  });

  it("get user mental health credits", async () => {
    const userCredits: Maybe<UserCredits> = await firestoreUserLookup(firestore).credits(userId);
    assert.equal(userCredits.unsafeCoerce().credits![CreditType.MentalHealth], 1);
  });

  it("get user service cost health credits", async () => {
    const serviceCost: Maybe<ServiceCost> = await firestoreServiceLookup(firestore).cost("QbVe6fTS7hVtmkCqaLFI");
    assert.equal(serviceCost.unsafeCoerce().type, CreditType.TherapySession);
  });

  it("get user service cost health credits", async () => {
    const serviceCost: Maybe<ServiceCost> = await firestoreServiceLookup(firestore).cost("QbVe6fTS7hVtmkCqaLFI");
    assert.equal(serviceCost.unsafeCoerce().costInVisitCredits, 2);
  });
});
