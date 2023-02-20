import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { Badge, Card,Grid, InputBase, TextInput,Button,Modal,Text, Group, Divider } from '@mantine/core';
import { TLifter } from '../../types';

type Props = {
  id: number;
  lifter: TLifter;
  lifters: TLifter[];
  escenarios: Array<TLifter[]>;
  setLifters: Dispatch<SetStateAction<Array<TLifter[]>>>;
  selectedEscenario : number;
  withinRange : string
};

export const EscLifter = ({ id, lifter, lifters, setLifters, selectedEscenario, escenarios,withinRange }: Props) => {
  const [lifterState,setLifterState]=useState<TLifter[]>(lifters)
  const [winningLiftTotal,setWinningLiftTotal] = useState("");
  const [winningLiftPoints,setWinningLiftPoints] = useState("");
  const [nextUp,setNextup]=useState("")
  const [nextUpPoints,setNextupPoints]=useState("")
  const [opened, setOpened] = useState(false)
  const [withinReachNum,setWithinReachNum]=useState(0)
  const [withinReachArray,setWithinReachArray]=useState(Array<TLifter>)
  const [tieTotal,setTieTotal]=useState("")
  const [tiePoints,setTiePoints]=useState("")
  
  useEffect(()=>{
    var newEscenarios = [...escenarios]
    newEscenarios[selectedEscenario]=lifterState
    setLifters(newEscenarios)
  },[lifterState])

  const setLifter = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement>,
      attribute: 'squat' | 'bench' | 'deadlift' | 'name' | 'weight'
    ) => {
      const newLifters = lifterState.map((curLifter) => {
        if (curLifter.id === id) {
          const tempLifter = curLifter;
          tempLifter[attribute] = event.currentTarget.value;
          return tempLifter;
        }
        return curLifter;
      });
      setLifterState(newLifters);
    },
    [lifterState, setLifterState]
  );

  useEffect(() => {
    setLifterState(
      lifterState.map((curLifter) => {
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
  }, [lifterState[id].squat, lifterState[id].bench, lifterState[id].deadlift, lifterState[id].weight]);

  const sortLifterByProperty = useCallback(
    (property: 'total' | 'points') => {
      const liftersCopy = structuredClone(lifterState);

      if(property== 'total'){
        liftersCopy.sort((a, b)=> parseFloat(a['weight'] || '0') - parseFloat(b['weight'] || '0'));
        liftersCopy.sort((a, b) => parseFloat(b[property] || '0') - parseFloat(a[property] || '0'));
      }else{
        liftersCopy.sort((a, b) => parseFloat(b[property] || '0') - parseFloat(a[property] || '0'));
      }
      

      const order: { [key: number]: number } = {};

      var placing = 0

      liftersCopy.forEach((curLifter, idx) => {
        if(property=='total'){
          if(idx>0){
            if(liftersCopy[idx-1].total!=liftersCopy[idx].total){
              order[curLifter.id] = placing + 1;
              placing+=1
            }else{
              if(liftersCopy[idx-1].weight<liftersCopy[idx].weight){
                order[curLifter.id] = placing + 1;
                placing+=1
              }else if(liftersCopy[idx-1].weight>liftersCopy[idx].weight){
                liftersCopy[idx-1].id=placing+1
                order[curLifter.id] = placing
                placing+=1
              }else if(liftersCopy[idx-1].weight==liftersCopy[idx].weight){
                order[curLifter.id] = placing;
              }
            }
          }else{
            order[curLifter.id] = placing +1;
            placing+=1
          }
        }else if(property=='points'){
          if(idx>0){
            if(liftersCopy[idx-1].points!=liftersCopy[idx].points){
              order[curLifter.id] = placing + 1;
              placing+=1
            }else{
              order[curLifter.id] = placing;
            }
          }else{
            order[curLifter.id] = placing + 1;
            placing+=1
          }
        }
        
      });

      const p: 'Total' | 'Points' = property === 'total' ? 'Total' : 'Points';

      setLifterState(
        lifterState.map((curLifter) => {
          const updatedLifter = curLifter;
          updatedLifter[`posBy${p}`] = order[curLifter.id].toString();
          return updatedLifter;
        })
      );
    },
    [lifterState, setLifterState]
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

  const lookingForTies = (total : string, points: string, weight: string, name: string)=>{
    lifterState.forEach((lifter, index)=>{
      if(lifter.total==total && lifter.weight==weight && lifter.name!=name){
        setTieTotal("Tied")
      }
      if(lifter.points==points && lifter.name!=name){
        setTiePoints("Tied")
      }
    })
  }

  const toWinTotal = (total: string, posByTotal: string,weight:string)=>{
    let liftToWin = 0
    let oppositionPos = ""
    let oppWeight=0
    let result=""
    if(posByTotal=="1"){
      setNextup("To win")
      if(tieTotal!="Tied"){
        return String("🏆")
      }else{
        return "Tied for 🏆"
      }
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
    lifterState.forEach((lifter,index)=>{
      if(lifter.posByTotal==oppositionPos){
        liftToWin=parseFloat(lifter.total)-parseFloat(total)
        oppWeight=parseFloat(lifter.weight)
      }
    })
    if(liftToWin>0){
      result= String(liftToWin)+"kg+"
    }else{
      if(total=="0"){
        return ".."
      }
      if(oppWeight>=parseFloat(weight)){
        result= "Winning by bw"
      }else{
        result= "Losing by bw"
      }
    }
    return result
    
  }

  const toWinPoints = (posByPoints: string,weight:string,total:string)=>{
    let liftToWin
    let oppositionPos = ""
    if(posByPoints=="1"){
      setNextupPoints("To win")
      if(tiePoints!="Tied"){
        return String("🏆")
      }else{
        return "Tied for 🏆"
      }
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
    lifterState.forEach((lifter,index)=>{
      if(lifter.posByPoints==oppositionPos){
        liftToWin=calculatePointsToWin(weight,total,lifter.points)
      }
    })
    if(liftToWin==undefined){
      return ".."
    }
    return String(liftToWin)+"kg+"
  }

  const withinReach=(total:string,posByTotal:string,id:number)=>{
    var possibleOpp=0
    var temp:TLifter[]=[]
    lifterState.forEach((lifter,index)=>{
      if(lifter.id!=id && lifter.total!="0" && lifter.total!=""){
        if((parseFloat(lifter.total)>=(parseFloat(total)-parseFloat(withinRange)))&&(parseFloat(lifter.total)<=(parseFloat(total)))){
          possibleOpp+=1
          temp.push(lifter)
      }
      }
    })
    if(possibleOpp>=1){
      setWithinReachArray(temp)
      console.log(withinReachArray)
    }
    return possibleOpp
  }

  const showPossibleOpp=()=>{
    if(withinReachArray.length==0){
      return <Text>No opponents are within {withinRange}kg</Text>
    }else{
      return withinReachArray.map((lifter,index)=>
        oppRow(lifter.name,lifter.total, lifter.weight)
      )
  }}

  const oppRow=(name:string,total:string,weight:string)=>{
    var within=""
    if(-parseFloat(total)+parseFloat(lifter.total)>0){
      within = String(-parseFloat(total)+parseFloat(lifter.total))+"kg"
    }else{
      if(tieTotal!="Tied"){
        if(parseFloat(lifter.weight)<parseFloat(weight)){
          within = "Tied (BW)"
        }else{
          within = "Tied (BW)"
        }
      }else{
        within = "Tied"
      }
    }
    return <Grid mt={"lg"}>
      <Grid.Col md={3} span={4}>
      <InputBase label="Name" variant="unstyled" component="button">
        {name}
      </InputBase>
      </Grid.Col>
      <Grid.Col md={3} span={4}>
      <InputBase label="Total" variant="unstyled" component="button">
        {total}kg
      </InputBase>
      </Grid.Col>
      <Grid.Col md={3} span={4}>
      <InputBase label="Within" variant="unstyled" component="button">
      {within}
      </InputBase>
      </Grid.Col>
    </Grid>
  }
 

  useEffect(() => {
    sortLifterByProperty('total');
    console.log(lifterState)
  }, [lifterState[id].total,lifterState[id].weight]);

  useEffect(() => {
    sortLifterByProperty('points');
  }, [lifterState[id].points,lifterState[id].weight]);

  useEffect(()=>{
    var temp:TLifter[]=[]
    setWithinReachArray(temp)
    setTieTotal("")
    setTiePoints("")
    lookingForTies(lifter.total,lifter.points,lifter.weight,lifter.name);
    setWinningLiftTotal(toWinTotal(lifter.total,lifter.posByTotal,lifter.weight));
    setWinningLiftPoints(toWinPoints(lifter.posByPoints,lifter.weight,lifter.total));
    setWithinReachNum(withinReach(lifter.total,lifter.posByTotal,lifter.id));
  },[lifterState,withinRange])
  

  return (
      <Card mt="md" p="lg" radius="md" withBorder >
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
            variant="filled"
            value={lifter.weight}
            onChange={(e) => setLifter(e, 'weight')}
          />
        </Grid.Col>
        <Grid.Col md={2} span={4}>
          <TextInput
            placeholder="-"
            label="Squat"
            variant="filled"
            value={lifter.squat}
            onChange={(e) => setLifter(e, 'squat')}
            type="number"
          />
        </Grid.Col>
        <Grid.Col md={2} span={4}>
          <TextInput
            placeholder="-"
            label="Bench"
            variant="filled"
            value={lifter.bench}
            onChange={(e) => setLifter(e, 'bench')}
            type="number"
          />
        </Grid.Col>
        <Grid.Col md={2} span={4}>
          <TextInput
            placeholder="-"
            label="Deadlift"
            variant="filled"
            value={lifter.deadlift}
            onChange={(e) => setLifter(e, 'deadlift')}
            type="number"
          />
        </Grid.Col>
      </Grid>
      <Grid mt="lg">
        <Grid.Col md={3} span={6}>
          <InputBase label="Rank (total) 🏅" variant="unstyled" component="button">
            {lifter.posByTotal === '1'
              ? `🥇 ${tieTotal}`
              : lifter.posByTotal === '2'
              ? `🥈 ${tieTotal}`
              : lifter.posByTotal === '3'
              ? `🥉 ${tieTotal}`
              : `${lifter.posByTotal}°`}
          </InputBase>
        </Grid.Col>
        <Grid.Col md={3} span={6}>
          <InputBase label="Rank (points) 🪙" variant="unstyled" component="button">
            {lifter.posByPoints === '1'
              ? `🥇 ${tiePoints}`
              : lifter.posByPoints === '2'
              ? `🥈 ${tiePoints}`
              : lifter.posByPoints === '3'
              ? `🥉 ${tiePoints}`
              : `${lifter.posByTotal}°`}
          </InputBase>
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
        <Grid.Col md={3} span={6}>
          <InputBase label={`${nextUp} (kg)`} variant="unstyled" component="button" color="red">
            <Badge color={lifter.posByTotal=="1"?"yellow":"blue"}> {winningLiftTotal}</Badge>
          </InputBase>
        </Grid.Col>
        <Grid.Col md={3} span={6}>
          <InputBase label={`${nextUp} (pts)`} variant="unstyled" component="button">
            <Badge color={lifter.posByPoints=="1"?"yellow":"blue"}>{winningLiftPoints}</Badge>
          </InputBase>
        </Grid.Col>
        <Grid.Col md={3} span={6}>
          <InputBase label={`Within reach `} variant="unstyled" component="button">
            <Badge color={withinReachNum>3?"red":"blue"}>{withinReachNum}</Badge>
          </InputBase>
        </Grid.Col>
        <Grid.Col md={3} span={6}>
          <InputBase  variant="unstyled" component="button">
          <Button onClick={()=>setOpened(true)} variant="light">Show more</Button>
          </InputBase>
        </Grid.Col>
      </Grid>
      <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      overlayOpacity={0.55}
      overlayBlur={3}
      overflow="inside"
    >
      <Text fw={700}>{(lifter.name!="")?`${lifter.name}'s details`:"Details"}</Text>
      <Card mt="lg" mb="lg">
        <InputBase label={"Current total"} variant="unstyled" component="button">
        {(lifter.squat=="")? "0":lifter.squat} / {(lifter.bench==""?"0":lifter.bench)} / {(lifter.deadlift==""?"0":lifter.deadlift)} = <Badge>{lifter.total}kg</Badge>
        </InputBase>
      </Card>
      <Text mb="lg"><Badge mr="lg" >{lifter.posByTotal} {tieTotal}</Badge> Position by total </Text>
      <Text mb="lg"><Badge mr="lg" >{lifter.posByPoints} {tiePoints}</Badge> Position by points </Text>
      <Text mb="lg"><Badge mr="lg" >{winningLiftTotal}</Badge>{nextUp} (total)</Text>
      <Text mb="lg"><Badge mr="lg">{winningLiftPoints}</Badge>{nextUpPoints} (pts)</Text>
      <Divider></Divider>
      <Text mt="lg" mb="sm" fw={700}>Possible opponents</Text>
      <>
      {
        showPossibleOpp()
      }
      </>
    </Modal>
    </Card>
      );
};
