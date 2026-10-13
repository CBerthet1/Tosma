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
  let client: Client | null = null;
  

  try {
    client = new Client({
    url: process.env.LDAP_URL!,
    });
    await client.bind(
      process.env.LDAP_SERVICE_DN as string, 
      process.env.LDAP_SERVICE_PASSWORD as string
    );

    const safeUsername = escapeLDAPFilter(username.trim());

    // 1. Recherche de l'utilisateur
    const { searchEntries } = await client.search('dc=hyris,dc=tv', { 
      filter: `(uid=${safeUsername})`, 
      scope: 'sub',
      attributes: ['dn', 'displayName', 'uid', 'gidNumber'],
    });
    if (searchEntries.length === 0) {
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

        

    await client.bind(user.dn, password);
    
    return {
      name: user.displayName as string,
      groups: (user.groups as string[]),
    };

  } catch {
    console.error('Échec de l’authentification LDAP.');
  } finally {
    if (client) {
      try {
        await client.unbind();
      } catch {
        console.error('Échec de la déconnexion LDAP.');
      }
    }
  }
}