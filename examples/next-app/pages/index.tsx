import styled from '@universal-labs/styled';

const H1 = styled.H1``;
const P = styled.P``;
const View = styled.View``;

const IndexPage = () => {
  return (
    <View className='flex-1 items-center justify-center px-[15vw]'>
      <View className='bg-slate-300 px-10 shadow-xl justify-center items-center rounded-xl py-5'>
        <H1 className='text-4xl font-bold'>Card title</H1>
        <View>
          <P className='text(2xl slate-800) font-medium'>Subtitle</P>
          <P className='text(lg slate-900)'>
            dslkfjsdlkf jlksdjflk jsdlk fsdlkflsdkjlsdkjlkdsjsdlkflskdfl lkdsjflksdj lskd
            jlksdjf sdlklks djflksjfdslkjflsdkjflksdjflk jl sjdflkjsdlkf
          </P>
        </View>
      </View>
    </View>
  );
};

export default IndexPage;
