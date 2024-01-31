import { useMutation } from "@tanstack/react-query";
import { AuthOtpResponse } from "@supabase/supabase-js";
import { supabaseClient } from "~/app/utils/supabase";
import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState('');
  const signinMutation = useMutation<AuthOtpResponse, Error, {email: string}>({
    mutationFn: (vars) => supabaseClient.auth.signInWithOtp({email: vars.email})
  })

  return (
    <div className="bg-slate-500">
      <h1>Sign In – Magic Link</h1>
      
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button disabled={signinMutation.isPending} onClick={() => signinMutation.mutate({email})}>Sign In</button>
    </div>
  );
}
