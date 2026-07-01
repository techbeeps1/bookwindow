import React from 'react';
import { Typography, Card, CardBody } from "@material-tailwind/react";
import config from '@/app/config';
import Image from 'next/image';

interface FeatureCardProps {
  title: string;
  // icon: React.ElementType;
  icon:any;
  children: React.ReactNode| any;
}


export function FeatureCard({ icon, title, children }: FeatureCardProps) {
    return (
      <Card color="transparent" shadow={false} {...({} as React.ComponentProps<typeof Card>)}>
        <CardBody className="grid justify-center text-center" {...({} as React.ComponentProps<typeof CardBody>)}>
          <div className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-lg bg-gray-300 p-2.5 text-white shadow">
            {/* <Icon className="h-5 w-5" /> */}
            <Image className="h-5 w-5" src={`${config.apiUrl}storage/${icon}`} alt='icon' width={120} height={120}/>
          </div>
          <Typography variant="h5" color="blue-gray" className="mb-2" {...({} as React.ComponentProps<typeof Typography>)}>
            {title}
          </Typography>
          {/* <Typography className="px-8 font-normal !text-gray-500" {...({} as React.ComponentProps<typeof Typography>)}>
            {children}
          </Typography> */}
          <Typography className="px-8 font-normal !text-gray-500" 
           dangerouslySetInnerHTML={{ __html: children }}
          {...({} as React.ComponentProps<typeof Typography>)}>
          </Typography>
        </CardBody>
      </Card>
    );
  }

export default FeatureCard;