import Grid from '@/components/layout/Grid';
import { Button } from 'antd';
// import {pay ,borrow ,test} from '@/api/blockchain'

export default () => {


  return (
    <>
      <Grid className="mb-30 mt-60 ml-60" column={4} m={2} >

        {/* <Button shape="round" type="primary" size="middle" onClick={borrow}>
          Borrow
        </Button>

        <Button shape="round" type="primary" size="middle" onClick={pay}>
          Pay
        </Button>
        <Button shape="round" type="primary" size="middle" onClick={test}>
        test
        </Button>
         */}
      </Grid>
    </>
  )

}