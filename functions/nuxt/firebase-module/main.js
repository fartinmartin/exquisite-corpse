import * as firebase from 'firebase/app'

const config = {"apiKey":"AIzaSyC5Op1IGajRH-KUj-i9AS5hJ0Sw-yblERE","authDomain":"exquisite-corpse-d0cbf.firebaseapp.com","databaseURL":"https:\u002F\u002Fexquisite-corpse-d0cbf.firebaseio.com","projectId":"exquisite-corpse-d0cbf","storageBucket":"exquisite-corpse-d0cbf.appspot.com","messagingSenderId":"247490126037","appId":"1:247490126037:web:5721043963f00c0ec0425c","measurementId":"G-NX8QXVTJ4"}

export default async ({ res }, inject) => {
  if (!firebase.apps.length) {
    firebase.initializeApp(config)
  }
  const session = firebase.apps[0]

  /** --------------------------------------------------------------------------------------------- **/
  /** -------------------------------------- FIREBASE AUTH ---------------------------------------- **/
  /** --------------------------------------------------------------------------------------------- **/

  await import('firebase/auth')

  const fireAuth = session.auth()
  const fireAuthObj = firebase.auth
  inject('fireAuth', fireAuth)
  inject('fireAuthObj', fireAuthObj)

  /** --------------------------------------------------------------------------------------------- **/
  /** ------------------------------------- FIREBASE FIRESTORE ------------------------------------ **/
  /** --------------------------------------------------------------------------------------------- **/

  await import('firebase/firestore')

  const fireStore = session.firestore()
  const fireStoreObj = firebase.firestore
  inject('fireStore', fireStore)
  inject('fireStoreObj', fireStoreObj)

  /** --------------------------------------------------------------------------------------------- **/
  /** ----------------------------------- FIREBASE ANALYTICS -------------------------------------- **/
  /** --------------------------------------------------------------------------------------------- **/

  // Firebase Analytics can only be initiated on the client side
  if (process.client) {
    await import('firebase/analytics')

    const fireAnalytics = session.analytics()
    const fireAnalyticsObj = firebase.analytics
    inject('fireAnalytics', fireAnalytics)
    inject('fireAnalyticsObj', fireAnalyticsObj)
  }
}
