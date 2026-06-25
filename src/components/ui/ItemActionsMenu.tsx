/**
 * ItemActionsMenu
 *
 * Action Sheet para ações de itens da listagem: Renomear / Excluir / Cancelar.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { t } from '@lingui/core/macro';
import { useTheme, fontFamily } from '@/theme';
import { BottomSheet } from '@/components/ui/BottomSheet';
import {
  IconDotsThreeFilled,
  IconPencilSimple,
  IconTrashSimple,
} from '@/assets/icons';

interface ItemActionsMenuProps {
  onRename: () => void;
  onDelete: () => void;
  isRenaming?: boolean;
  isDeleting?: boolean;
}

export function ItemActionsMenu({ onRename, onDelete, isRenaming, isDeleting }: ItemActionsMenuProps) {
  const theme = useTheme();
  const [visible, setVisible] = React.useState(false);

  const close = (callback?: () => void) => {
    setVisible(false);
    callback?.();
  };

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={(e) => {
          e.stopPropagation();
          setVisible(true);
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={t`Opções`}
        accessibilityRole="button"
      >
        <IconDotsThreeFilled size={20} color={theme.semantic.text.secondary} />
      </TouchableOpacity>

      <BottomSheet visible={visible} onClose={() => setVisible(false)} dynamicSizing showCloseButton={false}>
        {/* Renomear */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => close(onRename)}
          disabled={isRenaming}
          activeOpacity={0.6}
        >
          {isRenaming ? (
            <ActivityIndicator size="small" color={theme.semantic.text.secondary} />
          ) : (
            <IconPencilSimple size={20} color={theme.semantic.text.secondary} />
          )}
          <Text style={[styles.itemText, { color: theme.semantic.text.secondary }]}>
            {t`Renomear`}
          </Text>
        </TouchableOpacity>

        <View style={[styles.separator, { backgroundColor: theme.semantic.border.secondary }]} />

        {/* Excluir */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => close(onDelete)}
          disabled={isDeleting}
          activeOpacity={0.6}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={theme.colors.error[6]} />
          ) : (
            <IconTrashSimple size={20} color={theme.colors.error[6]} />
          )}
          <Text style={[styles.itemText, { color: theme.colors.error[6] }]}>
            {t`Excluir`}
          </Text>
        </TouchableOpacity>

        {/* Cancelar */}
        <View style={styles.cancelWrapper}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.semantic.bg.spotlight }]}
            onPress={() => close()}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelText, { color: theme.semantic.text.secondary }]}>
              {t`Cancelar`}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 20,
    gap: 16,
  },
  itemText: {
    fontSize: 16,
    fontFamily: fontFamily.sans('400'),
    flex: 1,
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
  },
  cancelWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  cancelButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: fontFamily.sans('500'),
  },
});
