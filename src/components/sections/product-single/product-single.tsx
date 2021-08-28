import React from 'react';
import title from 'title';
import Image from 'next/image';
import { useImmer } from 'use-immer';
import truncate from 'lodash/truncate';
import { useQueryClient, useMutation } from 'react-query';
import { Swiper } from 'swiper';
import { Swiper as SwiperSlider, SwiperSlide } from 'swiper/react';
import { LoadingButton } from '@material-ui/lab';
import {
  Card,
  CardContent,
  Grid,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Typography,
  TextField,
  Alert,
} from '@material-ui/core';

import { CART_ITEM_COUNT_QUERY } from '@app/constants/query.constant';
import { IntlService } from '@app/services/intl.service';
import { CartService } from '@app/services/cart.service';
import { ProductService } from '@app/services/product.service';

type Props = ProductService.Single;

interface State {
  variant: ProductService.Single['variants'][0];
  quantity: number;
}

export const ProductSingle: React.FC<Props> = (props) => {
  const [swiper, setSwiper] = React.useState<Swiper>();
  const [state, setState] = useImmer<State>({ variant: props.variants[0], quantity: 1 });

  const queryClient = useQueryClient();
  const addItems = useMutation(CartService.addItems, {
    onSuccess: () => queryClient.invalidateQueries(CART_ITEM_COUNT_QUERY),
  });

  return (
    <section>
      <Card sx={{ marginBottom: '20px' }}>
        <Grid container>
          <Grid item xs={12} sm={5}>
            <SwiperSlider onSwiper={setSwiper}>
              {props.images.map(({ id, src, alt }) => (
                <SwiperSlide key={id}>
                  <Image src={src} alt={alt} width="768" height="1024" layout="responsive" />
                </SwiperSlide>
              ))}
            </SwiperSlider>
          </Grid>
          <Grid item xs={12} sm={7}>
            <div css={{ padding: '20px' }}>
              <Typography sx={{ marginBottom: '20px' }} gutterBottom variant="h5" component="h1">
                {title(props.title)}
              </Typography>

              <Typography sx={{ marginBottom: '15px' }} variant="body2" color="text.secondary">
                {truncate(props.description, { length: 120 })}
              </Typography>

              <Typography
                sx={{
                  marginBottom: '20px',
                  color: '#d32f2f',
                  fontWeight: 'bold',
                }}
                gutterBottom
                variant="h6"
                component="div"
              >
                {IntlService.formatPrice(state.variant.price)}
              </Typography>

              <FormControl fullWidth size="small" sx={{ marginBottom: '20px' }}>
                <InputLabel id="product-variants-label">Variants</InputLabel>
                <Select
                  label="Variants"
                  labelId="product-variants-label"
                  disabled={addItems.isLoading}
                  value={state.variant.id}
                  onChange={(event) => {
                    const variant = props.variants.find(({ id }) => id === event.target.value);
                    const slideIndex = props.images.findIndex((image) => image.id === variant?.image);

                    if (slideIndex !== -1) {
                      swiper?.slideTo(slideIndex);
                    }

                    setState((draft) => {
                      draft.variant = variant!;
                    });
                  }}
                >
                  {props.variants.map((variant) => (
                    <MenuItem key={variant.id} value={variant.id}>
                      {variant.title} - {IntlService.formatPrice(variant.price)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                sx={{ marginBottom: '20px' }}
                label="Quantity"
                type="number"
                size="small"
                fullWidth
                disabled={addItems.isLoading}
                value={state.quantity}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(event) => {
                  setState((draft) => {
                    draft.quantity = Number(event.target.value);
                  });
                }}
              />

              {addItems.isError && (
                <Alert sx={{ marginBottom: '20px' }} severity="error">
                  Could not add product items into your cart. Please try again!
                </Alert>
              )}

              <LoadingButton
                color="primary"
                variant="contained"
                size="large"
                fullWidth
                loading={addItems.isLoading}
                onClick={async () => {
                  await addItems.mutateAsync({
                    variantId: state.variant.id,
                    quantity: state.quantity,
                  });

                  setState((draft) => {
                    draft.quantity = 1;
                  });
                }}
              >
                Add to Cart
              </LoadingButton>
            </div>
          </Grid>
        </Grid>
      </Card>
      <Card>
        <CardContent>
          <Typography gutterBottom variant="h6" component="h2">
            Description
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {props.description}
          </Typography>
        </CardContent>
      </Card>
    </section>
  );
};
