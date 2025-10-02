import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function PaymentScreen() {
  const { appointmentId } = useLocalSearchParams();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const intentResponse = await fetch(`${API_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId: Number(appointmentId),
        }),
      });

      if (!intentResponse.ok) {
        throw new Error('Erro ao criar intenção de pagamento');
      }

      const { clientSecret } = await intentResponse.json();

      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('MODO DEMONSTRAÇÃO: Payment Intent criado, simulando aprovação');

      const confirmResponse = await fetch(`${API_URL}/api/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId: Number(appointmentId),
        }),
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.error || 'Erro ao confirmar pagamento');
      }

      Alert.alert(
        'Sucesso!',
        'Pagamento realizado com sucesso! Você receberá uma confirmação por SMS.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Pagamento
        </ThemedText>

        <View style={styles.paymentCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Método de Pagamento
          </ThemedText>
          
          <ThemedText style={styles.info}>
            ⚠️ MODO DEMONSTRAÇÃO: O pagamento está sendo simulado.
          </ThemedText>

          <ThemedText style={styles.info}>
            Em produção, esta tela integraria o @stripe/stripe-react-native com elementos de cartão seguros e processamento real através do Stripe Payment Intent criado no backend.
          </ThemedText>

          <ThemedText style={styles.info}>
            Para fins de teste, ao clicar em "Pagar Agora", o sistema:
            1. Cria um Payment Intent no Stripe
            2. Simula aprovação do pagamento
            3. Confirma o agendamento no banco
            4. Envia SMS de confirmação (se Twilio configurado)
          </ThemedText>
        </View>

        <View style={styles.statusCard}>
          <ThemedText style={styles.statusText}>
            Agendamento #{appointmentId}
          </ThemedText>
          <ThemedText style={styles.statusLabel}>
            Aguardando pagamento
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[styles.button, processing && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={processing}
        >
          {processing ? (
            <View>
              <ActivityIndicator color="#fff" />
              <ThemedText style={[styles.buttonText, { marginTop: 10 }]}>
                Processando pagamento...
              </ThemedText>
            </View>
          ) : (
            <ThemedText style={styles.buttonText}>Pagar Agora</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.replace('/(tabs)')}
          disabled={processing}
        >
          <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 20,
    marginTop: 20,
  },
  paymentCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  info: {
    marginBottom: 10,
    opacity: 0.7,
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: '#FFF3CD',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  statusText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusLabel: {
    color: '#856404',
  },
  button: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#DC3545',
    fontSize: 16,
  },
});
