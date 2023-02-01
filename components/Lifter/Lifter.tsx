import React, { Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import { Card, Grid, InputBase, TextInput } from '@mantine/core';
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

  const sortLifterByProperty = useCallback(
    (property: 'total' | 'points') => {
      const liftersCopy = structuredClone(lifters);
      liftersCopy.sort((a, b) => parseFloat(b[property] || '0') - parseFloat(a[property] || '0'));

      const order: { [key: number]: number } = {};
      liftersCopy.forEach((curLifter, idx) => {
        order[curLifter.id] = idx + 1;
      });

      const p: 'Total' | 'Points' = property === 'total' ? 'Total' : 'Points';

      setLifters(
        lifters.map((curLifter) => {
          const updatedLifter = curLifter;
          updatedLifter[`posBy${p}`] = order[curLifter.id].toString();
          return updatedLifter;
        })
      );
    },
    [lifters, setLifters]
  );

  useEffect(() => {
    sortLifterByProperty('total');
  }, [lifters[id].total]);

  useEffect(() => {
    sortLifterByProperty('points');
  }, [lifters[id].points]);

  return (
    <Card mt="lg" p="lg" radius="md" withBorder>
      <Grid>
        <Grid.Col md={3} span={6}>
          <TextInput
            placeholder="Athlete"
            label="Atleta"
            value={lifter.name}
            variant="filled"
            onChange={(e) => setLifter(e, 'name')}
          />
        </Grid.Col>
        <Grid.Col md={3} span={6}>
          <TextInput
            placeholder="Peso"
            label="Peso"
            type="number"
            value={lifter.weight}
            onChange={(e) => setLifter(e, 'weight')}
          />
        </Grid.Col>
        <Grid.Col md={3} span={6}>
          <InputBase label="Pos. by total" variant="unstyled" component="button">
            {lifter.posByTotal}
          </InputBase>
        </Grid.Col>
        <Grid.Col md={3} span={6}>
          <InputBase label="Pos. by points" variant="unstyled" component="button">
            {lifter.posByPoints}
          </InputBase>
        </Grid.Col>
        <Grid.Col md={2} span={4}>
          <TextInput
            placeholder="-"
            label="Squat"
            value={lifter.squat}
            onChange={(e) => setLifter(e, 'squat')}
            type="number"
          />
        </Grid.Col>
        <Grid.Col md={2} span={4}>
          <TextInput
            placeholder="-"
            label="Bench"
            value={lifter.bench}
            onChange={(e) => setLifter(e, 'bench')}
            type="number"
          />
        </Grid.Col>
        <Grid.Col md={2} span={4}>
          <TextInput
            placeholder="-"
            label="Deadlift"
            value={lifter.deadlift}
            onChange={(e) => setLifter(e, 'deadlift')}
            type="number"
          />
        </Grid.Col>
        <Grid.Col md={3} span={6}>
          <InputBase label="Total (kg)" variant="unstyled" component="button">
            {lifter.total}
          </InputBase>
        </Grid.Col>
        <Grid.Col md={3} span={6}>
          <InputBase label="IPF Points" variant="unstyled" component="button">
            {lifter.points || '-'}
          </InputBase>
        </Grid.Col>
      </Grid>
    </Card>
  );
};
