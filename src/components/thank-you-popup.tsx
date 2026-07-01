import React from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
} from "@material-tailwind/react";
import Image from "next/image";
import logo from "../../public/logos/logo.png";

export function ThankYouDialog({ open, handleOpen, orderNumber }: any) {
  return (
    <>
      <Dialog
        {...({
          size: "xl",
          open: open,
          handler: handleOpen,
          title: "Dialog Title",
          color: "blue",
          translate: "yes",
          slot: undefined,
          style: {},
        } as any)}
      >
        <DialogHeader {...({} as React.ComponentProps<typeof DialogHeader>)}>
          <Typography
            variant="h5"
            color="blue-gray"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            🎉 Successfully placed ordered 😊
          </Typography>
        </DialogHeader>
        <DialogBody
          divider
          className="grid place-items-center gap-4"
          {...({} as React.ComponentProps<typeof DialogBody>)}
        >
          <Image
            src={logo}
            alt={"book window logo"}
            className="h-[55px] w-[215px]"
            width={768}
            height={768}
          />
          <Typography
            color="blue-gray"
            variant="h4"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            Your order number is {orderNumber}
          </Typography>
          <Typography
            className="text-center font-normal text-gray-600"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            Thank you for your purchase. Your order has been placed
            successfully.<br></br>
            If you have questions about order , you can email us at
            <b> info@bookwindow.in</b> or call us <b> at +91 96023 68227</b>
          </Typography>
        </DialogBody>
        <DialogFooter
          className="space-x-2"
          {...({} as React.ComponentProps<typeof DialogFooter>)}
        >
          <Button
            variant="text"
            color="blue-gray"
            onClick={handleOpen}
            {...({} as React.ComponentProps<typeof Button>)}
          >
            close
          </Button>
          <Typography
            as="a"
            href={`/view-orders?order_number=${orderNumber}`}
            variant="h6"
            className="bg-green-800 text-white p-3 rounded hover:bg-green-900"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            View Orders
          </Typography>
        </DialogFooter>
      </Dialog>
    </>
  );
}
