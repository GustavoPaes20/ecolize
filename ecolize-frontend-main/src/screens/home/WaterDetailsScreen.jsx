import ScreenState from '../../components/common/ScreenState'
import useAsyncData from '../../hooks/useAsyncData'
import { getResourceDetails } from '../../services/resourceService'
import ResourceDetailsScreen from './ResourceDetailsScreen'

const waterIcon = require('../../../assets/images/home/water.png')

export default function WaterDetailsScreen({ navigation }) {
  const { data, loading, error, reload } = useAsyncData(() => getResourceDetails('water'), [])

  if (loading) {
    return <ScreenState title="Carregando consumo de água" description="Buscando seus dados." />
  }

  if (error || !data) {
    return (
      <ScreenState
        title="Não foi possível carregar o consumo de água"
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
      icon={waterIcon}
      currentValue={data.currentValue}
      comparisonText={data.comparisonText}
      tipText={data.tipText}
      colors={data.colors}
      bars={data.bars}
    />
  )
}
