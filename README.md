# Foodcalc

I recently did an Angular course on Udemy and wanted to play around with something in my free time.
So this is the outcome of a Sunday afternoon, with heavy GitHub Copilot usage.

## What does it to and who will want to use it?

This Angular app will help you in finding the correct broker prices if you are playing EQ2 on Origins server and you got a Provisioner. It will also show the fuel and raw cost you need to consider.

Currently only T7 recipies have been added, feel free to create a Pullrequest with lower level recipies. The system should be able to handle them as well. I am not sure if I will add it myself.

Please note: The prices you enter and all other things you add here, will be stored locally inside your browser. So everything you do with this app is your own risk / effort. I also do not take any responsibility and will not be able to support (a lot). Feel free to poke me though if you got feature proposals or something else on your mind.

# So how can I use it?

Out of the box, all recipies added will show you the fuel prices directly. But there is more: You can also add the current raw prices on the broker to the calculator which in turn will then also take those in consideration.

And there is one more feature: You can also add the current broker price for reference the items (the highest items with the longest duration for each food/drink type in each Tier). This price will then be computed into a cost/min factor, which then can be seen inside the recipie lists. This way you are able to price lower level items in a way, that people do not have any incentive to buy the longer lasting stuff. You will also be notified about the expected revenue or loss if you sell at that price. So in case something is sold below your production cost, you will see that this is a bad deal for you.

The app also provide the possibility to use click-to-copy, so if e.g. if you are inside the raw materials tab, you can just click the raw name to copy it to your clipboard. Also you can click most prices and copy the value in copper, which then in turn can be pasted into the broker window. Just press the copper button afterwards and the price will unfold itself.