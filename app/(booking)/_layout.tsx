import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="service"
        options={{
          title: 'Agendar Serviço',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="verify"
        options={{
          title: 'Verificação',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          title: 'Pagamento',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
