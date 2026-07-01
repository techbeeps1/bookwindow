import { FadeLoader } from 'react-spinners';

const FadeLoaderOverlay = () => (
  <div className="min-h-screen" style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 9999
  }}>
    <FadeLoader />
  </div>
);

export default FadeLoaderOverlay;
