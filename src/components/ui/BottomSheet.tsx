import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { t } from '@lingui/core/macro'
import { View, TouchableOpacity, StyleSheet, Modal, Keyboard } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated'
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import GorhomBottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  useBottomSheetTimingConfigs,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import { Easing } from 'react-native-reanimated'
import { useTheme, spacing } from '@/theme'
import { IconX } from '@/assets/icons'

interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  /** Fração da altura da tela ocupada pelo sheet. Default 0.85 (85%). Ignorado quando `dynamicSizing` é true. */
  heightFraction?: number
  /** Mostra o botão X no canto direito do header. Default true. */
  showCloseButton?: boolean
  /**
   * Quando true, o sheet se ajusta à altura natural do conteúdo (ideal para menus
   * de ação curtos). Quando false (default), usa altura fixa via `heightFraction`.
   */
  dynamicSizing?: boolean
  children: React.ReactNode
}

/**
 * Bottom sheet baseado em `@gorhom/bottom-sheet` (versão não-modal) renderizado
 * dentro de um `Modal` nativo do RN — animações no UI thread via Reanimated 4,
 * drag-to-dismiss e coordenação com scroll interno gerenciadas pelo pacote.
 *
 * Usamos o componente não-modal para evitar o portal/provider que tem problemas
 * de mount em Bridgeless mode (New Architecture). O `Modal` do RN cuida do
 * overlay e do z-index acima de tudo.
 *
 * API controlada por `visible` (compatível com Modal padrão).
 */
export function BottomSheet({
  visible,
  onClose,
  heightFraction = 0.85,
  showCloseButton = true,
  dynamicSizing = false,
  children,
}: BottomSheetProps) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const sheetRef = useRef<GorhomBottomSheet>(null)

  // Keyboard avoidance via react-native-keyboard-controller: a altura do teclado
  // é rastreada frame-a-frame na UI thread (sem o delay do handling interno do
  // gorhom dentro do Modal nativo). Aplicamos como paddingBottom animado no
  // conteúdo — o sheet (dynamic sizing) cresce junto e mantém o input visível.
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation()
  const basePaddingBottom = dynamicSizing ? insets.bottom + spacing.md : 0
  const animatedContentStyle = useAnimatedStyle(() => ({
    paddingBottom: basePaddingBottom + Math.abs(keyboardHeight.value),
  }))

  // Animação interna do gorhom (inclui o re-size dinâmico ao abrir/fechar o
  // teclado). Mantemos curta e alinhada à duração típica do teclado iOS (~250ms)
  // para o card acompanhar o conteúdo sem "assentar" depois.
  const animationConfigs = useBottomSheetTimingConfigs({
    duration: 250,
    easing: Easing.out(Easing.ease),
  })

  const snapPoints = useMemo(
    () => (dynamicSizing ? undefined : [`${Math.round(heightFraction * 100)}%`]),
    [heightFraction, dynamicSizing],
  )

  // Estado interno: o Modal do RN só fecha quando a animação de slide-down do
  // bottom-sheet termina. Mantemos `isMounted` separado do `visible` do parent.
  const [isMounted, setIsMounted] = React.useState(visible)

  useEffect(() => {
    if (visible) {
      setIsMounted(true)
    } else if (isMounted) {
      // Quando o parent fecha, anima down primeiro; o Modal será desmontado em
      // onClose do GorhomBottomSheet.
      sheetRef.current?.close()
    }
  }, [visible, isMounted])

  const handleSheetClose = useCallback(() => {
    setIsMounted(false)
    onClose()
  }, [onClose])

  // Dispensa o teclado no INÍCIO da animação de fechar (qualquer caminho:
  // Cancelar, toque no fundo, arrastar). Sem isso o teclado fica aberto um
  // instante depois do sheet sumir.
  const handleAnimate = useCallback((_fromIndex: number, toIndex: number) => {
    if (toIndex === -1) {
      Keyboard.dismiss()
    }
  }, [])

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        style={[
          props.style,
          { backgroundColor: theme.colors.brandBlue[5] + '66' },
        ]}
        pressBehavior="close"
      />
    ),
    [theme.colors.brandBlue],
  )

  if (!isMounted) return null

  return (
    <Modal
      visible
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="none"
      onRequestClose={() => sheetRef.current?.close()}
    >
      <GestureHandlerRootView style={styles.modalRoot}>
      <GorhomBottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        index={0}
        animationConfigs={animationConfigs}
        enablePanDownToClose
        enableDynamicSizing={dynamicSizing}
        // Pan-to-close apenas pela alça — libera o conteúdo (PagerView)
        // para receber os gestos horizontais de troca de página.
        enableContentPanningGesture={false}
        onAnimate={handleAnimate}
        onClose={handleSheetClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: theme.semantic.bg.container,
          borderTopLeftRadius: theme.borderRadius.lg,
          borderTopRightRadius: theme.borderRadius.lg,
        }}
        handleIndicatorStyle={{ backgroundColor: theme.semantic.border.default }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView style={styles.container}>
          <Reanimated.View style={animatedContentStyle}>
            {showCloseButton ? (
              <View style={[styles.header, { paddingHorizontal: theme.spacing.lg }]}>
                <TouchableOpacity
                  onPress={() => sheetRef.current?.close()}
                  hitSlop={8}
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
            ) : null}
            {children}
          </Reanimated.View>
        </BottomSheetView>
      </GorhomBottomSheet>
      </GestureHandlerRootView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
