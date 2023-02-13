import { useState } from 'react';
import { Button, Center, Container, Title,Text,Card } from '@mantine/core';

import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Lifter } from '../components/Lifter/Lifter';
import { TLifter } from '../types';

export default function HomePage() {
  const [id, setId] = useState(0);
  const [lifters, setLifters] = useState<TLifter[]>([]);

  const addLifter = () => {
    setLifters([
      ...lifters,
      {
        id,
        name: '',
        weight: '',
        squat: '',
        bench: '',
        deadlift: '',
        total: '',
        points: '',
        posByTotal: '',
        posByPoints: '',
      },
    ]);
    setId(id + 1);
  };

  const initialInstructions = ()=>{  
    if(lifters.length==0){
      return <Card mt="md">Add your lifters and fill in their lifts (at least their squat and bench press) to show predictive data.</Card>
    }
  }

  return (
    <>
      <ColorSchemeToggle />
      <Center>
        <Container m="lg">
        <Title order={2}>Meet<Text span fw={400} inherit>Day</Text></Title>
          <Title order={3}>📈 Accumulated Total</Title>
          <Button mt="lg" variant="light" onClick={addLifter}>
            + lifter
          </Button>
          <Button mt="lg" variant="light" ml="lg" color="green">
            + guess
          </Button>
          <>
          {initialInstructions()}
          </>
          {lifters.map((lifter, idx) => (
            <Lifter key={idx} lifter={lifter} lifters={lifters} setLifters={setLifters} id={idx} />
          ))}
        </Container>
      </Center>
    </>
  );
}
