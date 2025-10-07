import { memo } from 'react';
import type { NodeProps } from 'reactflow';
import type { JSX } from 'react';
import { SiAmazon, SiDocker, SiAmazonapigateway, SiAmazons3, SiAmazonec2, SiAmazonrds, SiAmazondynamodb, SiNginx, SiFirebase, SiRedis, SiPostgresql } from 'react-icons/si';
import { Handle, Position } from 'reactflow';

const iconMap: Record<string, JSX.Element> = {
  lambda: <SiAmazon />,
  docker: <SiDocker />,
  'api gateway': <SiAmazonapigateway />,
  s3: <SiAmazons3 />,
  ec2: <SiAmazonec2 />,
  rds: <SiAmazonrds />,
  dynamodb: <SiAmazondynamodb />,
  nginx: <SiNginx />,
  firebase: <SiFirebase />,
  redis: <SiRedis />,
  postgres: <SiPostgresql />
};

function IconNode({ data }: NodeProps): JSX.Element {
  return (
    <div
      style={{
        padding: '10px',
        border: '2px solid #aaa',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
        minWidth: '80px',
        color: '#333',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ fontSize: '2rem' }}>
        {iconMap[data.label.toLowerCase()] || <SiAmazon />}
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(IconNode);
