/**
 * RenameModal — Modal de renomeação genérico
 * Funciona em iOS e Android (Alert.prompt é iOS-only)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useTheme, fontFamily } from '@/theme';
import { IconX } from '@/assets/icons';

interface RenameModalProps {
  visible: boolean;
  /** Nome da entidade exibido no título: "Renomear Imagem", "Renomear Vídeo", etc. */
  entityName?: string;
  currentValue: string;
  onConfirm: (newName: string) => void;
  onClose: () => void;
  isPending?: boolean;
}

export function RenameModal({
  visible,
  entityName,
  currentValue,
  onConfirm,
  onClose,
  isPending = false,
}: RenameModalProps) {
  const theme = useTheme();
  useLingui();
  const [value, setValue] = useState(currentValue);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setValue(currentValue);
      const timer = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(timer);
    }
  }, [visible, currentValue]);

  const hasChanged = value.trim() !== '' && value.trim() !== currentValue;

  const handleConfirm = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === currentValue) {
      onClose();
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm(trimmed);
  }, [value, currentValue, onConfirm, onClose]);

  const title = entityName ? t`Renomear ${entityName}` : t`Renomear`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Pressable
          style={[
            styles.card,
            {
              backgroundColor: theme.semantic.bg.elevated,
              borderRadius: theme.borderRadius.lg,
              borderColor: theme.semantic.border.default,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.semantic.text.primary }]}>
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={8}
              disabled={isPending}
              accessibilityLabel={t`Fechar`}
              accessibilityRole="button"
              style={[
                styles.closeButton,
                {
                  borderRadius: theme.borderRadius.md,
                  borderColor: theme.semantic.border.default,
                },
              ]}
            >
              <IconX size={20} color={theme.semantic.text.tertiary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.container, { borderColor: theme.semantic.border.default }]}>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  color: theme.semantic.text.primary,
                  borderColor: theme.semantic.border.default,
                  backgroundColor: theme.semantic.bg.container,
                },
              ]}
              value={value}
              onChangeText={setValue}
              onSubmitEditing={handleConfirm}
              selectTextOnFocus
              returnKeyType="done"
              maxLength={100}
              editable={!isPending}
              accessibilityLabel={t`Novo nome`}
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor:
                    hasChanged && !isPending
                      ? theme.colors.brandBlue[6]
                      : theme.semantic.bg.containerDisabled,
                },
              ]}
              onPress={handleConfirm}
              disabled={!hasChanged || isPending}
              accessibilityLabel={t`Salvar`}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.saveButtonText,
                  (!hasChanged || isPending) && { color: theme.semantic.text.disabled },
                ]}
              >
                {isPending ? t`Salvando...` : t`Salvar`}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.sans('600'),
  },
  closeButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  input: {
    width: '100%',
    fontSize: 14,
    fontFamily: fontFamily.sans('400'),
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 64,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: fontFamily.sans('500'),
    color: '#ffffff',
  },
});
