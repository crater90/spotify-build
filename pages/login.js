import { getProviders, signIn } from 'next-auth/react'
function login({ providers }) {
  return (
    <div className='flex flex-col items-center justify-center bg-black min-h-screen w-full'>
          <img className='w-52 mb-5' src='https://pbs.twimg.com/media/EwhaIBAXMAQCoY4?format=png&name=900x900' />
        { Object.values(providers).map((provider) => (
            <div key={provider.name}>
                <button onClick={() => signIn(provider.id, { callbackUrl: "/" })} className='bg-[#18D860] text-white px-4 py-2 rounded-full'>Login with {provider.name}</button>
            </div>
        ))}
    </div>
  )
}

export default login

export async function getServerSideProps() {
    const providers = await getProviders();

    return {
        props: {
            providers
        }
    }
}