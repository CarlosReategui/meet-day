import React, { Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import { Card, Grid, TextInput } from '@mantine/core';
import { TLifter } from '../../types';

type Props = {
  id: number;
  lifter: TLifter;
  lifters: TLifter[];
  setLifters: Dispatch<SetStateAction<TLifter[]>>;
};

export const Lifter = ({ id, lifter, lifters, setLifters }: Props) => {
  const setLifter = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement>,
      attribute: 'squat' | 'bench' | 'deadlift' | 'name' | 'weight'
    ) => {
      const newLifters = lifters.map((curLifter) => {
        if (curLifter.id === id) {
          const tempLifter = curLifter;
          tempLifter[attribute] = event.currentTarget.value;
          return tempLifter;
        }
        return curLifter;
      });
      setLifters(newLifters);
    },
    [lifters, setLifters]
  );

  useEffect(() => {
    setLifters(
      lifters.map((curLifter) => {
        if (curLifter.id === id) {
          const updatedLifter = curLifter;
          const newTotal =
            parseFloat(curLifter.squat || '0') +
            parseFloat(curLifter.bench || '0') +
            parseFloat(curLifter.deadlift || '0');

          updatedLifter.total = newTotal.toString();

          const A = 1199.72839;
          const B = 1025.18162;
          const C = 0.00921;

          if (curLifter.weight) {
            const calcPoints =
              newTotal * (100 / (A - B * Math.exp(-C * parseFloat(curLifter.weight))));
            updatedLifter.points = calcPoints.toFixed(2);
          }

          return updatedLifter;
        }
        return curLifter;
      })
    );
  }, [lifters[id].squat, lifters[id].bench, lifters[id].deadlift, lifters[id].weight]);

  useEffect(() => {
    const liftersCopy = structuredClone(lifters);
    // const sortedLifters = liftersCopy.sort((a, b) => {
    //   return parseFloat(b.total || '0') - parseFloat(a.total || '0');
    // });

    liftersCopy.sort((a, b) => parseFloat(b.total || '0') - parseFloat(a.total || '0'));

    const order: { [key: number]: number } = {};
    liftersCopy.forEach((curLifter, idx) => {
      order[curLifter.id] = idx + 1;
    });

    setLifters(
      lifters.map((curLifter) => {
        const updatedLifter = curLifter;
        updatedLifter.posByTotal = order[curLifter.id].toString();
        return updatedLifter;
      })
    );
  }, [lifters[id].total]);

  useEffect(() => {
    const liftersCopy = structuredClone(lifters);
    liftersCopy.sort((a, b) => parseFloat(b.points || '0') - parseFloat(a.points || '0'));
    // const sortedLifters = liftersCopy.sort((a, b) => {
    //   return parseFloat(b.points || '0') - parseFloat(a.points || '0');
    // });

    const order: { [key: number]: number } = {};
    liftersCopy.forEach((curLifter, idx) => {
      order[curLifter.id] = idx + 1;
    });

    setLifters(
      lifters.map((curLifter) => {
        const updatedLifter = curLifter;
        updatedLifter.posByWeight = order[curLifter.id].toString();
        return updatedLifter;
      })
    );
  }, [lifters[id].points]);

  return (
    <Card mt="lg" p="lg" radius="md" withBorder>
      <Grid>
        <>
          <Grid.Col span={3}>
            <TextInput
              placeholder="Athlete"
              label="Atleta"
              value={lifter.name}
              variant="filled"
              onChange={(e) => setLifter(e, 'name')}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              placeholder="Peso"
              label="Peso"
              type="number"
              value={lifter.weight}
              onChange={(e) => setLifter(e, 'weight')}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              placeholder=""
              label="Pos. by total"
              disabled
              variant="unstyled"
              value={lifter.posByTotal}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              placeholder=""
              label="Pos. by points"
              disabled
              variant="unstyled"
              value={lifter.posByWeight}
            />
          </Grid.Col>
        </>
        <>
          <Grid.Col span={2}>
            <TextInput
              placeholder="-"
              label="Squat"
              value={lifter.squat}
              onChange={(e) => setLifter(e, 'squat')}
              type="number"
            />
          </Grid.Col>
          <Grid.Col span={2}>
            <TextInput
              placeholder="-"
              label="Bench"
              value={lifter.bench}
              onChange={(e) => setLifter(e, 'bench')}
              type="number"
            />
          </Grid.Col>
          <Grid.Col span={2}>
            <TextInput
              placeholder="-"
              label="Deadlift"
              value={lifter.deadlift}
              onChange={(e) => setLifter(e, 'deadlift')}
              type="number"
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              placeholder="-"
              label="Total (kg)"
              value={lifter.total}
              disabled
              variant="unstyled"
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              placeholder="-"
              label="IPF Points"
              type="number"
              value={lifter.points}
              disabled
              variant="unstyled"
            />
          </Grid.Col>
        </>
      </Grid>
    </Card>
  );
};
