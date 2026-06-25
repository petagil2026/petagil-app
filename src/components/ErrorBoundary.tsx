import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Trans } from '@lingui/react/macro';
import { captureException } from '@/services/monitoring/sentry';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    captureException(error, {
      componentStack: info.componentStack ?? undefined,
    });
  }

  handleReload = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title}><Trans>Algo deu errado</Trans></Text>
        <Text style={styles.subtitle}><Trans>Tente reiniciar o aplicativo.</Trans></Text>
        <TouchableOpacity style={styles.button} onPress={this.handleReload}>
          <Text style={styles.buttonText}><Trans>Reiniciar</Trans></Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#111',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
});
