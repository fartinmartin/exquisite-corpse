import admin from 'firebase-admin'

const config = {"apiKey":"AIzaSyDaoNA0Wi3pb93VZE066031x1mxfi9lAtk","authDomain":"exquisite-corpse-club.firebaseapp.com","databaseURL":"https:\u002F\u002Fexquisite-corpse-club.firebaseio.com","projectId":"exquisite-corpse-club","storageBucket":"exquisite-corpse-club.appspot.com","messagingSenderId":"624585249671","appId":"1:624585249671:web:0c69b0f2bb39c7224df922","measurementId":"G-M6YF2FQJZ0"}

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
