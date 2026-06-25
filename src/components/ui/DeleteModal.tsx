/**
 * DeleteModal — Modal de confirmação de exclusão genérico
 * Baseado no DeleteConfirmDialog do chat
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { fontFamily, useTheme } from '@/theme';
import { IconX } from '@/assets/icons';

interface DeleteModalProps {
  visible: boolean;
  /** Nome da entidade para título: "Excluir Imagem", "Excluir Vídeo", etc. */
  entityName?: string;
  /** Nome/título do item (será truncado se necessário) */
  itemTitle: string;
  onConfirm: () => void;
  onClose: () => void;
  isPending?: boolean;
}

export function DeleteModal({
  visible,
  entityName,
  itemTitle,
  onConfirm,
  onClose,
  isPending = false,
}: DeleteModalProps) {
  const theme = useTheme();
  useLingui();

  const displayTitle = itemTitle.length > 50 ? itemTitle.slice(0, 50) + '…' : itemTitle;
  const title = entityName ? t`Excluir ${entityName}` : t`Excluir`;

  const handleConfirm = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onConfirm();
  }, [onConfirm]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={[
          styles.backdrop,
          { backgroundColor: theme.colors.brandBlue[5] + '66' },
        ]}
        onPress={onClose}
      >
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
            <Text style={[styles.message, { color: theme.semantic.text.secondary }]}>
              {t`Tem certeza que deseja excluir`}{' '}
              <Text style={styles.itemTitle}>{displayTitle}</Text>?
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { borderColor: theme.semantic.border.default },
              ]}
              onPress={onClose}
              disabled={isPending}
              accessibilityLabel={t`Cancelar`}
              accessibilityRole="button"
            >
              <Text style={[styles.cancelButtonText, { color: theme.semantic.text.primary }]}>
                {t`Cancelar`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                {
                  borderColor: isPending
                    ? theme.semantic.border.default
                    : theme.colors.error[6],
                },
              ]}
              onPress={handleConfirm}
              disabled={isPending}
              accessibilityLabel={t`Confirmar exclusão`}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  isPending
                    ? { color: theme.semantic.text.disabled }
                    : { color: theme.colors.error[6] },
                ]}
              >
                {isPending ? t`Excluindo...` : t`Sim, quero excluir`}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  message: {
    fontSize: 14,
    fontFamily: fontFamily.sans('400'),
    textAlign: 'center',
    lineHeight: 22,
  },
  itemTitle: {
    fontFamily: fontFamily.sans('700'),
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 64,
    paddingBottom: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: fontFamily.sans('500'),
  },
  confirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: fontFamily.sans('500'),
  },
});
