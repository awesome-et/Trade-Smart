'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface PlaceOrderDialogProps {
  symbol: string;
  currentPrice: number;
  signalType: 'buy' | 'sell';
  signalId?: string;
  strategyId?: string;
  onSuccess?: () => void;
}

export function PlaceOrderDialog({
  symbol,
  currentPrice,
  signalType,
  signalId,
  strategyId,
  onSuccess,
}: PlaceOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOPMARKET' | 'STOPLIMIT'>('MARKET');
  const [price, setPrice] = useState(currentPrice);
  const [triggerPrice, setTriggerPrice] = useState(currentPrice);

  const transactionType = signalType === 'buy' ? 'BUY' : 'SELL';

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          quantity,
          price: orderType === 'LIMIT' ? price : undefined,
          orderType,
          transactionType,
          triggerPrice: ['STOPLIMIT', 'STOPMARKET'].includes(orderType) ? triggerPrice : undefined,
          signalId,
          strategyId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to place order');
        return;
      }

      setSuccess(true);
      setError('');
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={signalType === 'buy' ? 'default' : 'destructive'}
          size="sm"
        >
          Place {transactionType === 'BUY' ? 'Buy' : 'Sell'} Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Place {transactionType} Order</DialogTitle>
          <DialogDescription>
            {symbol} @ ₹{currentPrice.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stock Info */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Symbol</p>
              <p className="font-semibold">{symbol}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Signal</p>
              <p className="font-semibold capitalize">{signalType}</p>
            </div>
          </div>

          {/* Order Type */}
          <div>
            <Label htmlFor="order-type">Order Type</Label>
            <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
              <SelectTrigger id="order-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MARKET">Market</SelectItem>
                <SelectItem value="LIMIT">Limit</SelectItem>
                <SelectItem value="STOPMARKET">Stop Market</SelectItem>
                <SelectItem value="STOPLIMIT">Stop Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Limit Price */}
          {orderType === 'LIMIT' && (
            <div>
              <Label htmlFor="price">Limit Price</Label>
              <Input
                id="price"
                type="number"
                step={0.05}
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || currentPrice)}
              />
            </div>
          )}

          {/* Trigger Price for Stop Orders */}
          {['STOPMARKET', 'STOPLIMIT'].includes(orderType) && (
            <div>
              <Label htmlFor="trigger-price">Trigger Price</Label>
              <Input
                id="trigger-price"
                type="number"
                step={0.05}
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(parseFloat(e.target.value) || currentPrice)}
              />
            </div>
          )}

          {/* Order Summary */}
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Value</span>
              <span className="font-semibold">₹{(quantity * (orderType === 'LIMIT' ? price : currentPrice)).toFixed(2)}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-100 text-green-800 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Order placed successfully!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={loading || success}
              className="flex-1"
            >
              {loading ? 'Placing...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
