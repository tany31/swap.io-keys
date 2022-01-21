export const SELECT_COLOR_SCHEME = 'selectColorScheme'
export const MNEMONIC_PHRASE_SHOW = 'mnemonicPhraseShow'
export const FORM_PASSWORD = 'formPassword'
export const MNEMONIC_PHRASE_WRITE = 'mnemonicPhraseWrite'

export const STEPS_RECOVER_PROFILE = {
  [MNEMONIC_PHRASE_WRITE]: 1,
  [FORM_PASSWORD]: 2
}

export const STEPS_CREATE_PROFILE = {
  [SELECT_COLOR_SCHEME]: 1,
  [MNEMONIC_PHRASE_SHOW]: 2,
  [MNEMONIC_PHRASE_WRITE]: 3,
  [FORM_PASSWORD]: 4
}