import ScreenState from '../../components/common/ScreenState'
import useAsyncData from '../../hooks/useAsyncData'
import { getResourceDetails } from '../../services/resourceService'
import ResourceDetailsScreen from './ResourceDetailsScreen'

const energyIcon = require('../../../assets/images/home/energy.png')

export default function EnergyDetailsScreen({ navigation }) {
  const { data, loading, error, reload } = useAsyncData(() => getResourceDetails('energy'), [])

  if (loading) {
    return <ScreenState title="Carregando consumo de luz" description="Buscando seus dados." />
  }

  if (error || !data) {
    return (
      <ScreenState
        title="Não foi possível carregar o consumo de luz"
        description="Tente novamente em instantes."
        actionLabel="Recarregar"
        onActionPress={reload}
      />
    )
  }

  return (
    <ResourceDetailsScreen
      navigation={navigation}
      title={data.title}
      icon={energyIcon}
      currentValue={data.currentValue}
      comparisonText={data.comparisonText}
      tipText={data.tipText}
      colors={data.colors}
      bars={data.bars}
    />
  )
}
