import admin from 'firebase-admin'

const config = {"apiKey":"AIzaSyC5Op1IGajRH-KUj-i9AS5hJ0Sw-yblERE","authDomain":"exquisite-corpse-d0cbf.firebaseapp.com","databaseURL":"https:\u002F\u002Fexquisite-corpse-d0cbf.firebaseio.com","projectId":"exquisite-corpse-d0cbf","storageBucket":"exquisite-corpse-d0cbf.appspot.com","messagingSenderId":"247490126037","appId":"1:247490126037:web:5721043963f00c0ec0425c","measurementId":"G-NX8QXVTJ4"}

const simulateUserRecord = ({
  uid,
  email,
  email_verified: emailVerified,
  name: displayName
}) => ({
  uid,
  email,
  emailVerified,
  displayName
})

if (!admin.apps.length) {
  admin.initializeApp(config)
}

export default async ({ req, res }) => {
  if (!req || !req.headers.authorization) {
    return
  }

  // Parse the injected ID token from the request header.
  const authorizationHeader = req.headers.authorization || ''
  const components = authorizationHeader.split(' ')
  const idToken = components.length > 1 ? components[1] : ''

  try {
    // Try to verify the id token, additionally checking if the token was revoked
    const decodedToken = await admin.auth().verifyIdToken(idToken)

    if (decodedToken.uid) {
      const authUser = simulateUserRecord(decodedToken)

      res.locals = {
        ...res.locals,
        user: {
          ...authUser,
					allClaims: decodedToken,
					idToken,
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}
