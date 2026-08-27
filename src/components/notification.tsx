import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const MTDialog = Dialog as any;
const MTDialogHeader = DialogHeader as any;
const MTDialogBody = DialogBody as any;
const MTDialogFooter = DialogFooter as any;

export  function NotificationDialog({
  open,
  handleOpen,
}: {
  open: boolean;
  handleOpen: () => void;
}) {
  return (
    <MTDialog
      open={open}
      handler={handleOpen}
      size="sm"
      className="rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Top */}
      <MTDialogHeader className="flex flex-col items-center bg-gradient-to-b from-red-50 to-white px-8 pt-8 pb-4 border-b">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 ring-8 ring-red-50">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
        </div>

        <h2 className="mt-5 text-2xl font-bold text-gray-900">
          Payment Failed
        </h2>

        <p className="mt-2 text-center text-sm text-gray-500">
          We couldn't complete your payment.
        </p>
      </MTDialogHeader>

      {/* Body */}
      <MTDialogBody className="px-8 py-6">
        

        <div className="mt-5 rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Don't worry!</span>
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            No amount has been deducted. If your bank shows a temporary hold,
            it will usually be reversed automatically within a short time.
          </p>
        </div>
      </MTDialogBody>

      {/* Footer */}
      <MTDialogFooter className="flex flex-col gap-3 border-t bg-gray-50 px-6 py-5 sm:flex-row">
      
        <button
          onClick={() => {
            handleOpen();
            // Retry Payment
          }}
          className="w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:bg-gray-900"
        >
          Close
        </button>
      </MTDialogFooter>
    </MTDialog>
  );
}