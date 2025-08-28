const AuthToast = (
  description: string,
  toast: any,
  title: string,
  status: string
) => {
  //   const toast = useToast();
  toast({
    title: title,
    description: description,
    position: "top-right",
    status: status,
    duration: 2000,
    isClosable: false,
  });
};

export default AuthToast;
