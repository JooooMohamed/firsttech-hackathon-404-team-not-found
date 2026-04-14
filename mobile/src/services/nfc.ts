import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';

export const nfcService = {
  async isSupported(): Promise<boolean> {
    try {
      return await NfcManager.isSupported();
    } catch {
      return false;
    }
  },

  async isEnabled(): Promise<boolean> {
    try {
      return await NfcManager.isEnabled();
    } catch {
      return false;
    }
  },

  async init(): Promise<void> {
    await NfcManager.start();
  },

  async writePayload(payload: string): Promise<void> {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const bytes = Ndef.encodeMessage([Ndef.textRecord(payload)]);
      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
      }
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  },

  async readPayload(): Promise<string | null> {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      if (tag?.ndefMessage?.[0]) {
        const record = tag.ndefMessage[0];
        // Decode NDEF text record (skip language code header)
        if (record.payload && record.payload.length > 0) {
          const langCodeLength = record.payload[0];
          const text = String.fromCharCode(
            ...record.payload.slice(1 + langCodeLength),
          );
          return text;
        }
      }
      return null;
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  },

  cancel(): void {
    NfcManager.cancelTechnologyRequest();
  },
};
