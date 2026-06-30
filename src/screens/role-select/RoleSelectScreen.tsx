/**
 * RoleSelectScreen — escolha de papel (tutor / veterinário / passeador).
 * É a BIFURCAÇÃO inicial do onboarding (decisão de fluxo 2026-06-29): o usuário
 * seleciona um papel e toca em "Continuar", que navega para o formulário de
 * cadastro daquele papel — é lá que o `register` acontece, no submit.
 *
 * Reaproveitada como fallback no MainNavigator (já autenticado, sem papel): nesse
 * caso apenas fixa o papel (`selectRole`), sem navegar para cadastro. As duas
 * situações se distinguem por `isAuthenticated` (não há mais rascunho de conta).
 *
 * Visual fiel ao design do Figma (node 450:2): tiles de ícone com gradiente,
 * card selecionado em gradiente amarelo + borda azul, botão em gradiente azul.
 * Cores/medidas são valores exatos do mock (não passam pelos tokens do tema).
 */
import { useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ScreenContainer } from '@/components/ui'
import { IconCheck } from '@/assets/icons'
import { useAuth } from '@/app/providers'
import type { Role } from '@/types/auth'
import type { AuthStackParamList } from '@/navigation/types'
import { ROLE_OPTIONS } from './roleOptions'

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'RoleSelect'>

// Direção dos gradientes (135° ≈ canto superior-esquerdo → inferior-direito)
const GRADIENT_START = { x: 0, y: 0 }
const GRADIENT_END = { x: 1, y: 1 }

const CARD_SELECTED_BG: [string, string] = ['#FFF9DD', '#FFF3B0']
const BUTTON_BG: [string, string] = ['#2E7CB8', '#1E5F92']

// Cada papel leva ao seu próprio formulário de cadastro (onde ocorre o register).
const CADASTRO_ROUTE: Record<Role, keyof AuthStackParamList> = {
  tutor: 'CadastroTutor',
  vet: 'CadastroVet',
  passeador: 'CadastroPasseador',
}

export function RoleSelectScreen() {
  const navigation = useNavigation<Navigation>()
  const { selectedRole, isAuthenticated, selectRole } = useAuth()
  // Pré-seleciona o papel já escolhido (sessão restaurada), com fallback para tutor.
  const [selected, setSelected] = useState<Role>(selectedRole ?? 'tutor')

  // Onboarding (não autenticado): segue para o cadastro do papel escolhido.
  // Fallback (já autenticado, sem papel): apenas fixa o papel.
  const handleContinue = () => {
    if (isAuthenticated) {
      selectRole(selected)
      return
    }
    navigation.navigate(CADASTRO_ROUTE[selected])
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Como você{'\n'}vai usar?</Text>
          <Text style={styles.subtitle}>Você pode ter mais de um perfil depois</Text>
        </View>

        <View style={styles.cards} accessibilityRole="radiogroup">
          {ROLE_OPTIONS.map(option => {
            const isSelected = selected === option.id
            return (
              <Pressable
                key={option.id}
                onPress={() => setSelected(option.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={option.title}
              >
                {isSelected ? (
                  <LinearGradient
                    colors={CARD_SELECTED_BG}
                    start={GRADIENT_START}
                    end={GRADIENT_END}
                    style={[styles.card, styles.cardSelected]}
                  >
                    <CardContent option={option} isSelected />
                  </LinearGradient>
                ) : (
                  <View style={[styles.card, styles.cardUnselected]}>
                    <CardContent option={option} isSelected={false} />
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>

        <View style={styles.buttonShadow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continuar"
            onPress={handleContinue}
          >
            <LinearGradient
              colors={BUTTON_BG}
              start={GRADIENT_START}
              end={GRADIENT_END}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Continuar</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  )
}

function CardContent({
  option,
  isSelected,
}: {
  option: (typeof ROLE_OPTIONS)[number]
  isSelected: boolean
}) {
  return (
    <>
      {isSelected ? (
        <View style={[styles.tile, styles.tileSelected]}>
          <Emoji char={option.emoji} />
        </View>
      ) : (
        <LinearGradient
          colors={option.tileGradient}
          start={GRADIENT_START}
          end={GRADIENT_END}
          style={styles.tile}
        >
          <Emoji char={option.emoji} />
        </LinearGradient>
      )}

      <View style={styles.textBlock}>
        <Text style={styles.cardTitle}>{option.title}</Text>
        <Text
          style={[styles.cardDesc, isSelected ? styles.cardDescSelected : styles.cardDescDefault]}
        >
          {option.description}
        </Text>
      </View>

      {isSelected ? (
        <View style={styles.radioOn}>
          <IconCheck size={18} color="#FFFFFF" />
        </View>
      ) : (
        <View style={styles.radioOff} />
      )}
    </>
  )
}

function Emoji({ char }: { char: string }) {
  return (
    <Text style={styles.emoji} accessibilityElementsHidden importantForAccessibility="no">
      {char}
    </Text>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 22 },

  header: { marginTop: 56 },

  title: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 34,
    lineHeight: 39,
    color: '#13344E',
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: '#4C6680',
    marginTop: 8,
  },

  cards: { marginTop: 32, gap: 18 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingLeft: 18,
    paddingRight: 20,
    paddingVertical: 24,
  },
  cardUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0EEF9',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#2E7CB8',
    // Sombra azul suave (Overlay+Shadow do mock)
    shadowColor: '#1E5F92',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },

  tile: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileSelected: {
    backgroundColor: '#FFFFFF',
    // Sombra âmbar suave do tile branco sobre o card amarelo
    shadowColor: '#A07800',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  emoji: { fontSize: 32, textAlign: 'center' },

  textBlock: { flex: 1, marginLeft: 16 },
  cardTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 21,
    lineHeight: 27,
    color: '#13344E',
  },
  cardDesc: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  cardDescDefault: { color: '#4C6680' },
  cardDescSelected: { color: '#6B5A1F' },

  radioOn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2E7CB8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOff: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D6EAF8',
  },

  buttonShadow: {
    // Botão logo abaixo dos cards (fluxo natural, não fixo na base)
    marginTop: 28,
    borderRadius: 20,
    shadowColor: '#1E5F92',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  button: {
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
})
