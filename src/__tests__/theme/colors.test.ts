import { lightTheme } from '@/theme/colors';

describe('Tema PetÁgil (light)', () => {
  it('usa o fundo azul claro do PetÁgil em bg.layout (AC8)', () => {
    expect(lightTheme.bg.layout).toBe('#EAF4FB');
  });

  it('não mantém o fundo herdado do hashtag', () => {
    expect(lightTheme.bg.layout).not.toBe('#f5f7fa');
  });

  it('usa azul profundo como texto primário', () => {
    expect(lightTheme.text.primary).toBe('#1E5F92');
  });
});
