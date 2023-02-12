import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { Badge, Card, Grid, InputBase, TextInput } from '@mantine/core';
import { TLifter } from '../../types';

type Props = {
  id: number;
  lifter: TLifter;
  lifters: TLifter[];
  setLifters: Dispatch<SetStateAction<TLifter[]>>;
};

export const Lifter = ({ id, lifter, lifters, setLifters }: Props) => {
  const [winningLiftTotal,setWinningLiftTotal] = useState("");
  const [winningLiftPoints,setWinningLiftPoints] = useState("");
  const [nextUp,setNextup]=useState("")
  const [nextUpPoints,setNextupPoints]=useState("")

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

  const calculatePointsToWin=(weight: string,total:string,oppPoints:string)=>{
    const A = 1199.72839;
    const B = 1025.18162;
    const C = 0.00921;
    let totalRequired
    let winningLift
    if(weight){
      totalRequired= parseFloat(oppPoints)/(100 / (A - B * Math.exp(-C * parseFloat(weight))));
      winningLift=totalRequired-parseFloat(total)
      winningLift = winningLift.toFixed(2)
    }
    return winningLift

  }

  const toWinTotal = (total: string, posByTotal: string,weight:string)=>{
    let liftToWin = 0
    let oppositionPos = ""
    let oppWeight=0
    let result=""
    if(posByTotal=="1"){
      setNextup("To win")
      return String("🏆")
    }else if(posByTotal=="2"){
      oppositionPos="1"
      setNextup("For 1st place")
    }else if(posByTotal=="3"){
      oppositionPos="2"
      setNextup("For 2nd place")
    }else{
      oppositionPos="3"
      setNextup("For podium")
    }
    lifters.forEach((lifter,index)=>{
      if(lifter.posByTotal==oppositionPos){
        liftToWin=parseFloat(lifter.total)-parseFloat(total)
        oppWeight=parseFloat(lifter.weight)
      }
    })
    if(liftToWin>0){
      result= "Lift above "+String(liftToWin)+"kg"
    }else{
      if(oppWeight>=parseFloat(weight)){
        result= "Winning by bodyweight"
      }else{
        result= "Losing by bodyweight"
      }
    }
    return result
    
  }

  const toWinPoints = (posByPoints: string,weight:string,total:string)=>{
    let liftToWin
    let oppositionPos = ""
    if(posByPoints=="1"){
      setNextupPoints("To win")
      return String("🏆")
    }else if(posByPoints=="2"){
      oppositionPos="1"
      setNextupPoints("For 1st place")
    }else if(posByPoints=="3"){
      oppositionPos="2"
      setNextupPoints("For 2nd place")
    }else{
      oppositionPos="3"
      setNextupPoints("For podium")
    }
    lifters.forEach((lifter,index)=>{
      if(lifter.posByPoints==oppositionPos){
        liftToWin=calculatePointsToWin(weight,total,lifter.points)
      }
    })
    return "Lift above "+String(liftToWin)+"kg"
  }

  useEffect(() => {
    sortLifterByProperty('total');
  }, [lifters[id].total]);

  useEffect(() => {
    sortLifterByProperty('points');
  }, [lifters[id].points]);

  useEffect(()=>{
    setWinningLiftTotal(toWinTotal(lifter.total,lifter.posByTotal,lifter.weight));
    setWinningLiftPoints(toWinPoints(lifter.posByPoints,lifter.weight,lifter.total))
  },[lifters])

  return (
    <Card mt="lg" p="lg" radius="md" withBorder>
      <Grid>
        <Grid.Col md={3} span={6}>
          <TextInput
            placeholder="Athlete"
            label="Athlete 🏋️‍♂️"
            value={lifter.name}
            variant="filled"
            onChange={(e) => setLifter(e, 'name')}
          />
        </Grid.Col>
        <Grid.Col md={3} span={6}>
          <TextInput
            placeholder="Weight"
            label="Weight (kg) ⚖️"
            type="number"
            value={lifter.weight}
            onChange={(e) => setLifter(e, 'weight')}
          />
        </Grid.Col>
        <Grid.Col md={3} span={6}>
          <InputBase label="Rank (total) 🏅" variant="unstyled" component="button">
            {lifter.posByTotal === '1'
              ? '🥇'
              : lifter.posByTotal === '2'
              ? '🥈'
              : lifter.posByTotal === '3'
              ? '🥉'
              : `${lifter.posByTotal}°`}
          </InputBase>
        </Grid.Col>
        <Grid.Col md={3} span={6}>
          <InputBase label="Rank (points) 🪙" variant="unstyled" component="button">
            {lifter.posByPoints === '1'
              ? '🥇'
              : lifter.posByPoints === '2'
              ? '🥈'
              : lifter.posByPoints === '3'
              ? '🥉'
              : `${lifter.posByTotal}°`}
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
          <InputBase label="Total (kg) 🏹" variant="unstyled" component="button">
            {lifter.total}
          </InputBase>
        </Grid.Col>
        <Grid.Col md={3} span={6}>
          <InputBase label="IPF Points 🎯" variant="unstyled" component="button">
            {lifter.points || '-'}
          </InputBase>
        </Grid.Col>
        <Grid.Col md={3} span={6} offset={6}>
          <InputBase label={`${nextUp} (kg) 🤞`} variant="unstyled" component="button" color="red">
            <Badge color={lifter.posByTotal=="1"?"yellow":"blue"}> {winningLiftTotal}</Badge>
          </InputBase>
        </Grid.Col>
        <Grid.Col md={3} span={6}>
          <InputBase label={`${nextUp} (points) 🤞`} variant="unstyled" component="button">
            <Badge color={lifter.posByPoints=="1"?"yellow":"blue"}>{winningLiftPoints}</Badge>
          </InputBase>
        </Grid.Col>
      </Grid>
    </Card>
  );
};
