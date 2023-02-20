import { useEffect, useState } from 'react';
import { Button, Center, Container, Title,Text,Card,NativeSelect, Group,Select, Modal, TextInput, Badge } from '@mantine/core';

import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Lifter } from '../components/Lifter/Lifter';
import { TLifter } from '../types';
import { EscLifter } from '../components/Lifter/EscLifter';

export default function HomePage() {
  const [id, setId] = useState(0);
  const [lifters, setLifters] = useState<TLifter[]>([]);
  const [withinRange, setWithinRange] = useState('20');
  const [escenario,setEscenario]= useState<Array<TLifter[]>>([]);
  const [selectEscenario, setSelectEscenario] = useState("0")
  const [namesOfEscenarios,setNamesOfEscenarios]= useState<Array<string>>([])
  const [modalEscenario,setModalEscenario]=useState(false)
  const [nameEscenario,setNameEscenario]=useState("")

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

  const addEscenario = () => {
    let clonedLifters = [...lifters].map((lifter)=>{
      return {...lifter}
    })

    if(lifters.length>0){
      setEscenario([
        ...escenario,
        clonedLifters
      ])
    }
    var newSelect = String(escenario.length)
    console.log(newSelect)
    setSelectEscenario(newSelect)
    setModalEscenario(true)
    
  }

  const showEscenarios = ()=>{
    var temp:string[]=[]
    temp.push("original")

    escenario.forEach((esc,index)=>{
      temp.push(String(index))

    })

    if(escenario.length>0){
      return <NativeSelect
      data={temp}
      description="Escenarios"
      variant="filled"
      size="sm"
      value={selectEscenario}
      onChange={(event) => setSelectEscenario(event.currentTarget.value)}
    />
    }
  }

  const addNameOfEscenario = ()=>{
    if(nameEscenario==undefined || nameEscenario.length<1){
      setNameEscenario("")
    }
    setNamesOfEscenarios(
      [...namesOfEscenarios,nameEscenario]
    )
    setNameEscenario("")
    setModalEscenario(false)
  }

  const showEscenarioName=()=>{
    if(selectEscenario!="original" && escenario.length>0 && namesOfEscenarios[Number(selectEscenario)]!=""){
      return <>
      <Badge mt="lg" color="green">
        {namesOfEscenarios[Number(selectEscenario)]}
      </Badge>
      </>
    }
  }
  const showLifters = ()=>{
    if(escenario.length>0){
      if(selectEscenario=="original"){
        return lifters.map((lifter, idx) => (
          <Lifter key={idx} lifter={lifter} lifters={lifters} setLifters={setLifters} id={idx} withinRange={withinRange}/>
        ))
      }else{
        var escenarioSelecciondo:TLifter[] = escenario[parseFloat(selectEscenario)]
        return escenarioSelecciondo.map((escLifter, idx) => (
          <EscLifter key={idx} lifter={escLifter} lifters={escenarioSelecciondo} id={idx} setLifters ={setEscenario} selectedEscenario ={Number(selectEscenario)} withinRange={withinRange} escenarios={escenario}/>
        ))
      }
    }else{
      return lifters.map((lifter, idx) => (
        <Lifter key={idx} lifter={lifter} lifters={lifters} setLifters={setLifters} id={idx} withinRange={withinRange}/>
      ))
    }
    
  }

  const initialInstructions = ()=>{  
    if(lifters.length==0){
      return <Card mt="md">Add your lifters and fill in their lifts (at least their squat and bench press) to show predictive data.</Card>
    }
  }

  useEffect(()=>{
    if(selectEscenario!="original" && escenario.length>0){
      console.log(escenario[parseFloat(selectEscenario)])
    }
    console.log(selectEscenario)
    
  },[escenario,selectEscenario])

  return (
    <>
      <ColorSchemeToggle />
      <Center>
        <Container m="lg">
        <Title order={2}>Meet<Text span fw={400} inherit>Day</Text></Title>
          <Title order={3} mb="lg">📈 Accumulated Total</Title>
          <Group>
            {(selectEscenario=="original" || escenario.length==0)?
            <Group>
          <Button mt="lg" variant="light" onClick={addLifter}>
            + lifter
          </Button>
          <Button mt="lg" variant="light" color="green" onClick={addEscenario}>
          + escenario
        </Button>
        </Group> :""
          }
          
          <NativeSelect
            data={['20', '40', '60', '80']}
            description="Within range"
            variant="filled"
            size="sm"
            value={withinRange}
            onChange={(event) => setWithinRange(event.currentTarget.value)}
          />
          {showEscenarios()}
          {showEscenarioName()}
          </Group>
          <>
          {initialInstructions()}
          
          {showLifters()}
          </>
          
      <Modal
        opened={modalEscenario}
        onClose={() => {setModalEscenario(false)
          addNameOfEscenario
        }}
        title="Introduce yourself!"
      >
        <>
        {
          <TextInput
          placeholder="Insert name.."
          label="Escenario's name"
          variant="filled"
          value={nameEscenario}
          onChange={(e) => setNameEscenario(e.currentTarget.value)}
          type="text"
          />
        }
        </>
        <Button mt="lg" variant="light" onClick={addNameOfEscenario}>Save Name</Button>
      </Modal>
        </Container>
      </Center>
    </>
  );
}
