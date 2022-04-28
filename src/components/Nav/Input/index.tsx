import React, {useState, useEffect, useRef} from 'react';
import {TextInput, View, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {NavState} from '@/components/Nav';
import {SetCurrentWebViewSource} from '@/components/WebView';
import {getProcessedUrl, safeDecodingURI} from '@/utils';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface InputProps {
  navState: NavState;
  setCurrentWebViewSource: SetCurrentWebViewSource;
}

const Input: ThemeFunctionComponent<InputProps> = props => {
  const {navState, setCurrentWebViewSource, theme} = props;
  const {url} = navState;
  const [selection, setSelection] = useState<{start: number; end?: number}>();
  const [textValue, setTextValue] = useState<string | undefined>('');
  const textInputRef = useRef<TextInput>(null);

  const {t} = useTranslation();

  useEffect(() => {
    setTextValue(safeDecodingURI(url));
  }, [url]);

  const handleChangeText = (val: string) => {
    // console.log('handleChangeText:', val);
    setTextValue(val);
  };

  const handleSubmitEditing = async (val: string | undefined) => {
    // console.log('handleSubmitEditing:', val);
    const uri = await getProcessedUrl(val);
    setCurrentWebViewSource({uri});
  };

  const onFocus = () => {
    setSelection(undefined);
  };

  const onBlur = () => {
    setSelection({start: 0});
    setTimeout(() => {
      setSelection(undefined);
    }, 0);
  };

  return (
    // https://github.com/facebook/react-native/issues/29663
    <View style={styles.inputContainer}>
      <TextInput
        ref={textInputRef}
        style={[
          styles.input,
          {borderColor: theme?.colors.primary, color: theme?.colors.text},
        ]}
        onFocus={onFocus}
        onBlur={onBlur}
        onChangeText={text => handleChangeText(text)}
        onSubmitEditing={() => handleSubmitEditing(textValue)}
        autoCorrect={false}
        blurOnSubmit={true}
        selectTextOnFocus
        value={textValue}
        multiline={false}
        selection={selection}
        returnKeyType="search"
        placeholder={t('Search or Enter')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    height: 30,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 2,
    paddingHorizontal: 6,
    height: 30,
    borderWidth: 1,
  },
});

export default withTheme<InputProps>(Input, 'Input');
