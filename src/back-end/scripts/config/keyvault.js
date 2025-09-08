const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

// Key Vault URL을 .env 파일에 두거나 직접 입력합니다.
// Key Vault URL 자체는 민감 정보가 아니므로 .env에 두는 것이 편리합니다.
require('dotenv').config();
const keyVaultUrl = process.env.KEY_VAULT_URL;

if (!keyVaultUrl) {
  throw new Error("KEY_VAULT_URL 환경 변수가 설정되지 않았습니다.");
} else {
    console.log(keyVaultUrl)
}

const credential = new DefaultAzureCredential();
const client = new SecretClient(keyVaultUrl, credential);

// 여러 비밀을 한 번에 가져오는 헬퍼 함수
async function getSecrets(secretNames) {
  const secrets = {};
  for (const name of secretNames) {
    try {
      const secret = await client.getSecret(name);
      // Key Vault의 secret 이름에 포함된 하이픈(-)을 언더스코어(_)로 변경하여 객체 키로 사용
      secrets[name.replace(/-/g, '_')] = secret.value;
    } catch (error) {
        console.error(`비밀 정보 '${name}'를 가져오는 데 실패했습니다.`, error);
        throw error;
    }
  }
  return secrets;
}

module.exports = { getSecrets };