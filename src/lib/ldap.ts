import { Client } from 'ldapts';

/**
 * Échappe les caractères spéciaux pour éviter les injections LDAP.
 */
function escapeLDAPFilter(input: string): string {
  if (!input) return '';
  return input
    .replace(/\\/g, '\\5c')
    .replace(/\*/g, '\\2a')
    .replace(/\(/g, '\\28')     .replace(/\)/g, '\\29')
    .replace(/\0/g, '\\00');
}

export async function authenticateWithLDAP(username: string, password: string) {

  console.log("TEST VARIABLES :", {
    url: process.env.LDAP_URL,
    dn: process.env.LDAP_SERVICE_DN
  });
  
  let client: Client | null = null;
  

  try {
    client = new Client({
    url: process.env.LDAP_URL!,
    });
    // ÉTAPE 1 : Le "Service Bind" (On s'identifie en tant qu'application)
    console.log("Étape 1 : Connexion au LDAP avec le compte de service...");
    await client.bind(
      process.env.LDAP_SERVICE_DN as string, 
      process.env.LDAP_SERVICE_PASSWORD as string
    );

    const safeUsername = escapeLDAPFilter(username.trim());

    console.log("Étape 2 : Service connecté. Recherche de l'utilisateur :", safeUsername);

    // 1. Recherche de l'utilisateur
    const { searchEntries } = await client.search('dc=hyris,dc=tv', { 
      filter: `(uid=${safeUsername})`, 
      scope: 'sub',
      attributes: ['dn', 'displayName', 'uid', 'gidNumber'],
    });

    if (searchEntries.length === 0) {
      console.log("Étape 3 (ÉCHEC) : Utilisateur introuvable dans le dossier !");
      return null; 
    }

    const user = searchEntries[0];

    // 2. Recherche RESTREINTE aux objets de type posixGroup
    const { searchEntries: groupEntries } = await client.search('dc=hyris,dc=tv', {
      filter: `(&(objectClass=posixGroup)(|(memberUid=${safeUsername})(gidNumber=${user.gidNumber})))`,
      scope: 'sub',
      attributes: ['cn', 'gidNumber'],
    });

    // 3. Extraction propre des noms de groupes
    // Remplace le bloc d'extraction par celui-ci :
    user.groups = groupEntries.map(entry => {
      const cn = entry.cn;
      const rawCn = Array.isArray(cn) ? cn[0] : cn;
      
      // Convertit explicitement les Buffers en string si nécessaire
      return Buffer.isBuffer(rawCn) ? rawCn.toString('utf8') : String(rawCn);
    });

        

    console.log("Étape 4 : Utilisateur trouvé ! Son chemin exact (DN) est :", user.dn);
    console.log("Groupes récupérés pour l'utilisateur :", user.groups);
    
    console.log("Étape 5 : Test du mot de passe...");
    await client.bind(user.dn, password);

    console.log("Étape 6 (SUCCÈS) : Mot de passe valide !");
    
    return {
      name: user.displayName as string,
      groups: (user.groups as string[]),
    };

  } catch (error) {
    if (error instanceof Error) {
      console.error('ÉCHEC (Erreur LDAP) :', error.message);
    } else {
      // Si c'est autre chose, on le transforme en texte
      console.error('ÉCHEC (Erreur LDAP) :', String(error));
    }
    // TRÈS IMPORTANT : On coupe la connexion au LDAP
    if (client) {
      try {
        await client.unbind();
      } catch (unbindError) {
        console.error('Erreur lors de la déconnexion LDAP:', unbindError);
      }
    }
  }
}